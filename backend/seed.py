import os
from database import SessionLocal
import models
import datetime

def seed():
    db = SessionLocal()
    
    # Check if suppliers already exist
    if db.query(models.Supplier).count() > 0:
        print("Database already has suppliers. Skipping seed.")
        db.close()
        return

    # Add Suppliers
    suppliers = [
        models.Supplier(name="Metro Toptancı Market", contact_info="Gıda ve İçecek Toptancısı", email="info@metro.tr", phone="0850 222 22 22"),
        models.Supplier(name="Kardeşler Kasap", contact_info="Taze Et ve Tavuk", email="kardesler@kasap.com", phone="0555 555 55 55"),
        models.Supplier(name="Yeşil Vadi Manavı", contact_info="Günlük Taze Sebze Meyve", email="sebze@yesilvadi.com", phone="0532 333 33 33")
    ]
    
    db.add_all(suppliers)
    db.commit()
    
    # Add Purchase Orders
    pos = [
        models.PurchaseOrder(
            supplier_id=suppliers[0].id,
            status="Tamamlandı",
            order_date=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        ),
        models.PurchaseOrder(
            supplier_id=suppliers[1].id,
            status="Bekliyor",
            order_date=datetime.datetime.utcnow()
        )
    ]
    db.add_all(pos)
    db.commit()

    # Create dummy products if none
    if db.query(models.Product).count() == 0:
        products = [
            models.Product(name="Un", quantity=50, unit="kg", category="Kuru Gıda"),
            models.Product(name="Kıyma", quantity=10, unit="kg", category="Et Ürünleri"),
            models.Product(name="Domates", quantity=20, unit="kg", category="Sebze Meyve")
        ]
        db.add_all(products)
        db.commit()
    
    products = db.query(models.Product).limit(3).all()

    # Add Purchase Order Items
    if len(products) > 0:
        items = [
            models.PurchaseOrderItem(po_id=pos[0].id, product_id=products[0].id, quantity=50, unit=products[0].unit),
            models.PurchaseOrderItem(po_id=pos[1].id, product_id=products[1].id if len(products)>1 else products[0].id, quantity=15, unit="kg")
        ]
        db.add_all(items)
        db.commit()

    print("Seeding successful!")
    db.close()

if __name__ == "__main__":
    seed()
