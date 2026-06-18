from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas.expense_schema import CategoryCreate, CategoryResponse
import models

router = APIRouter()


@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name).all()


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(category_data: CategoryCreate, db: Session = Depends(get_db)):

    existing = db.query(models.Category).filter(
        models.Category.name == category_data.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Category '{category_data.name}' already exists."
        )

    new_category = models.Category(
        name           = category_data.name,
        color          = category_data.color,
        icon           = category_data.icon,
        monthly_budget = category_data.monthly_budget,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id:   int,
    category_data: CategoryCreate,
    db: Session = Depends(get_db)
):
    category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    name_clash = db.query(models.Category).filter(
        models.Category.name == category_data.name,
        models.Category.id   != category_id
    ).first()

    if name_clash:
        raise HTTPException(
            status_code=409,
            detail=f"Another category named '{category_data.name}' already exists."
        )

    category.name           = category_data.name
    category.color          = category_data.color
    category.icon           = category_data.icon
    category.monthly_budget = category_data.monthly_budget

    db.commit()
    db.refresh(category)

    return category


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):

    category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    linked_count = db.query(models.Expense).filter(
        models.Expense.category_id == category_id
    ).count()

    if linked_count > 0:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot delete '{category.name}' — {linked_count} expense(s) use it. "
                f"Reassign them to another category first."
            )
        )

    db.delete(category)
    db.commit()

    return {"message": f"Category '{category.name}' deleted successfully."}