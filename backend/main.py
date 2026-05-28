from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import datetime

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Restoran Stok Takip API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

APP_VERSION = os.getenv("APP_VERSION", "v1")

@app.get("/")
def read_root():
    return {"message": "Restoran Stok API'sine Hoş Geldiniz", "version": APP_VERSION}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/products", response_model=list[schemas.Product])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.name == product.name).first()
    if db_product:
        db_product.quantity += product.quantity
        db_product.last_updated = datetime.datetime.utcnow()
    else:
        db_product = models.Product(**product.model_dump())
        db.add(db_product)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.name is not None:
        db_product.name = product.name
    if product.quantity is not None:
        db_product.quantity = product.quantity
    if product.unit is not None:
        db_product.unit = product.unit
    if product.category is not None:
        db_product.category = product.category
    if product.critical_threshold is not None:
        db_product.critical_threshold = product.critical_threshold
        
    db_product.last_updated = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db.query(models.RecipeIngredient).filter(models.RecipeIngredient.product_id == db_product.id).delete()
    db.query(models.PurchaseOrderItem).filter(models.PurchaseOrderItem.product_id == db_product.id).delete()
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

@app.get("/suppliers", response_model=list[schemas.Supplier])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()

@app.post("/suppliers", response_model=schemas.Supplier)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = models.Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@app.get("/recipes", response_model=list[schemas.Recipe])
def get_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).offset(skip).limit(limit).all()
    return recipes

@app.post("/recipes", response_model=schemas.Recipe)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = models.Recipe(name=recipe.name, description=recipe.description)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    for item in recipe.ingredients:
        db_ingredient = models.RecipeIngredient(
            recipe_id=db_recipe.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit=item.unit
        )
        db.add(db_ingredient)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@app.post("/recipes/{recipe_id}/cook")
def cook_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Helper function for unit conversion
    def convert_quantity(quantity, from_unit, to_unit):
        from_unit = from_unit.lower() if from_unit else ""
        to_unit = to_unit.lower() if to_unit else ""
        if from_unit == 'gram' and to_unit == 'kg': return quantity / 1000.0
        if from_unit == 'kg' and to_unit == 'gram': return quantity * 1000.0
        if from_unit == 'mililitre' and to_unit == 'litre': return quantity / 1000.0
        if from_unit == 'litre' and to_unit == 'mililitre': return quantity * 1000.0
        return quantity

    # Check stock first
    for ingredient in db_recipe.ingredients:
        db_product = db.query(models.Product).filter(models.Product.id == ingredient.product_id).first()
        if not db_product:
            raise HTTPException(status_code=400, detail=f"Product ID {ingredient.product_id} not found")
            
        required_quantity = convert_quantity(ingredient.quantity, ingredient.unit, db_product.unit)
        if db_product.quantity < required_quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {db_product.name}. (Gereken: {required_quantity} {db_product.unit})")

    alerts = []
    # Deduct stock
    for ingredient in db_recipe.ingredients:
        db_product = db.query(models.Product).filter(models.Product.id == ingredient.product_id).first()
        required_quantity = convert_quantity(ingredient.quantity, ingredient.unit, db_product.unit)
        db_product.quantity -= required_quantity
        db_product.last_updated = datetime.datetime.utcnow()
        
        # Check critical threshold
        if db_product.quantity <= 0:
            alerts.append(f"BİLGİ: {db_product.name} stoğu tükendiği için sistemden otomatik olarak silindi.")
            db.query(models.RecipeIngredient).filter(models.RecipeIngredient.product_id == db_product.id).delete()
            db.delete(db_product)
        elif db_product.quantity < db_product.critical_threshold:
            alerts.append(f"KRİTİK STOK UYARISI: {db_product.name} stoğu {db_product.quantity} {db_product.unit} seviyesine düştü!")

    db.commit()
    
    response = {"message": f"{db_recipe.name} cooked successfully!"}
    if alerts:
        response["alerts"] = alerts
        
    return response

@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    db.delete(db_recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}

@app.post("/orders")
def create_order(order: schemas.OrderRequest, db: Session = Depends(get_db)):
    alerts = []
    # Check stock first
    for item in order.items:
        db_product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not db_product:
            raise HTTPException(status_code=400, detail=f"Ürün bulunamadı (ID: {item.product_id})")
        if db_product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Yeterli stok yok! (Gereken: {item.quantity} {db_product.unit}, Mevcut: {db_product.quantity} {db_product.unit})")
    
    # Deduct stock
    for item in order.items:
        db_product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        db_product.quantity -= item.quantity
        db_product.last_updated = datetime.datetime.utcnow()
        
        # Check critical threshold
        if db_product.quantity <= 0:
            alerts.append(f"BİLGİ: {db_product.name} stoğu tükendiği için sistemden otomatik olarak silindi.")
            db.query(models.RecipeIngredient).filter(models.RecipeIngredient.product_id == db_product.id).delete()
            db.delete(db_product)
        elif db_product.quantity < db_product.critical_threshold:
            alerts.append(f"KRİTİK STOK UYARISI: {db_product.name} stoğu {db_product.quantity} {db_product.unit} seviyesine düştü!")

    db.commit()
    
    response = {"message": "Sipariş (kullanım) başarıyla kaydedildi!"}
    if alerts:
        response["alerts"] = alerts
        
    return response

@app.get("/employees", response_model=list[schemas.Employee])
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

@app.post("/employees", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = models.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(employee_id: int, employee: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Personel bulunamadı")
    
    if employee.name is not None:
        db_employee.name = employee.name
    if employee.role is not None:
        db_employee.role = employee.role
    if employee.phone is not None:
        db_employee.phone = employee.phone
    if employee.is_active is not None:
        db_employee.is_active = employee.is_active
        
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Personel bulunamadı")
    
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted successfully"}

# CPU yoğun bir işlem ekleyerek HPA'nın tetiklenmesini kolaylaştırıyoruz.
@app.get("/simulate-load")
def simulate_load():
    x = 0.0001
    for _ in range(10000000):
        x += x ** 0.5
    return {"message": "Load generated"}

@app.get("/purchase_orders", response_model=list[schemas.PurchaseOrder])
def get_purchase_orders(db: Session = Depends(get_db)):
    return db.query(models.PurchaseOrder).all()

@app.post("/purchase_orders", response_model=schemas.PurchaseOrder)
def create_purchase_order(po: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    db_po = models.PurchaseOrder(supplier_id=po.supplier_id, status=po.status)
    db.add(db_po)
    db.commit()
    db.refresh(db_po)

    for item in po.items:
        db_item = models.PurchaseOrderItem(
            po_id=db_po.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit=item.unit,
            unit_price=item.unit_price
        )
        db.add(db_item)
    db.commit()
    db.refresh(db_po)
    return db_po

@app.put("/purchase_orders/{po_id}", response_model=schemas.PurchaseOrder)
def update_purchase_order(po_id: int, po_update: schemas.PurchaseOrderUpdate, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    if db_po.status != "Tamamlandı" and po_update.status == "Tamamlandı":
        for item in db_po.items:
            db_product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            if db_product:
                db_product.quantity += item.quantity
                if item.unit_price is not None:
                    db_product.last_unit_price = item.unit_price
                db_product.last_updated = datetime.datetime.utcnow()
        db_po.status = "Tamamlandı"
        db.commit()
    elif po_update.status != db_po.status:
        db_po.status = po_update.status
        db.commit()
        
    db.refresh(db_po)
    return db_po
