from pydantic import BaseModel
from typing import Optional
import datetime

class ProductBase(BaseModel):
    name: str
    unit: Optional[str] = "kg"
    category: Optional[str] = "Diğer"
    critical_threshold: Optional[float] = 5.0
    last_unit_price: Optional[float] = 0.0

class ProductCreate(ProductBase):
    quantity: float

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    critical_threshold: Optional[float] = None
    last_unit_price: Optional[float] = None

class Product(ProductBase):
    id: int
    quantity: float
    last_updated: datetime.datetime

    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    name: str
    contact_info: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True

class RecipeIngredientBase(BaseModel):
    product_id: int
    quantity: float
    unit: Optional[str] = "kg"

class RecipeIngredientCreate(RecipeIngredientBase):
    pass

class RecipeIngredient(RecipeIngredientBase):
    id: int
    recipe_id: int

    class Config:
        from_attributes = True

class RecipeBase(BaseModel):
    name: str
    description: Optional[str] = None

class RecipeCreate(RecipeBase):
    ingredients: list[RecipeIngredientCreate]

class Recipe(RecipeBase):
    id: int
    
    # Not returning full ingredients list to keep schema simple unless needed, 
    # but let's include it for the UI to display recipe details
    ingredients: list[RecipeIngredient] = []

    class Config:
        from_attributes = True

class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: float
    unit: Optional[str] = "kg"
    unit_price: Optional[float] = None

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    po_id: int

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    supplier_id: int
    status: Optional[str] = "Bekliyor"

class PurchaseOrderCreate(PurchaseOrderBase):
    items: list[PurchaseOrderItemCreate]

class PurchaseOrderUpdate(BaseModel):
    status: str

class PurchaseOrder(PurchaseOrderBase):
    id: int
    order_date: datetime.datetime
    items: list[PurchaseOrderItem] = []

    class Config:
        from_attributes = True

class OrderItemRequest(BaseModel):
    product_id: int
    quantity: float

class OrderRequest(BaseModel):
    items: list[OrderItemRequest]

class EmployeeBase(BaseModel):
    name: str
    role: str
    phone: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class Employee(EmployeeBase):
    id: int
    hire_date: datetime.datetime
    is_active: bool

    class Config:
        from_attributes = True
