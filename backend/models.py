from sqlalchemy import (
    Column, Integer, String, Float,
    Date, DateTime, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String, unique=True, nullable=False)
    color          = Column(String, default="#6366F1")
    icon           = Column(String, default="💰")
    monthly_budget = Column(Float, nullable=True)

    expenses = relationship("Expense", back_populates="category_rel")


class Expense(Base):
    __tablename__ = "expenses"

    id          = Column(Integer, primary_key=True, index=True)
    raw_text    = Column(String, nullable=True)
    amount      = Column(Float, nullable=False)
    category    = Column(String, nullable=False)
    date        = Column(Date, nullable=False)
    description = Column(String, nullable=True)
    merchant    = Column(String, nullable=True)
    created_at  = Column(DateTime, server_default=func.now())

    category_id  = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category_rel = relationship("Category", back_populates="expenses")


class Budget(Base):
    __tablename__ = "budgets"

    id           = Column(Integer, primary_key=True, index=True)
    month        = Column(String, nullable=False, unique=True)
    total_budget = Column(Float, nullable=False)
    created_at   = Column(DateTime, server_default=func.now())