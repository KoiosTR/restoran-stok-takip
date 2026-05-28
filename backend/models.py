from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from database import Base
from sqlalchemy.orm import relationship
import datetime

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    quantity = Column(Float, default=0.0)
    unit = Column(String, default="kg")
    category = Column(String, default="Diğer")
    critical_threshold = Column(Float, default=5.0)
    last_unit_price = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)

    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, default="kg")

    recipe = relationship("Recipe", back_populates="ingredients")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    contact_info = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    order_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Bekliyor") # 'Bekliyor', 'Tamamlandı'
    
    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, default="kg")
    unit_price = Column(Float, nullable=True)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    hire_date = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=False)
