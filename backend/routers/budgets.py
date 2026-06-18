
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date
from typing import List

from database import get_db
from schemas.expense_schema import BudgetCreate, BudgetResponse
import models

router = APIRouter()


@router.get("/", response_model=List[BudgetResponse])
def get_all_budgets(db: Session = Depends(get_db)):
    return db.query(models.Budget).order_by(
        desc(models.Budget.month)
    ).all()


@router.post("/", response_model=BudgetResponse, status_code=201)
def set_budget(budget_data: BudgetCreate, db: Session = Depends(get_db)):

    if budget_data.total_budget <= 0:
        raise HTTPException(status_code=400, detail="Budget must be greater than zero.")

    existing = db.query(models.Budget).filter(
        models.Budget.month == budget_data.month
    ).first()

    if existing:
        existing.total_budget = budget_data.total_budget
        db.commit()
        db.refresh(existing)
        return existing

    new_budget = models.Budget(
        month        = budget_data.month,
        total_budget = budget_data.total_budget,
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget


@router.get("/current")
def get_current_budget(db: Session = Depends(get_db)):
    current_month = date.today().strftime("%Y-%m")

    budget = db.query(models.Budget).filter(
        models.Budget.month == current_month
    ).first()

    spent = db.query(
        func.sum(models.Expense.amount)
    ).filter(
        func.strftime("%Y-%m", models.Expense.date) == current_month
    ).scalar() or 0.0

    spent = round(spent, 2)

    if not budget:
        return {
            "month":          current_month,
            "total_budget":   None,
            "spent":          spent,
            "remaining":      None,
            "percentage_used": None,
            "status":         "no_budget",
            "message":        "No budget set for this month. Set one to track limits."
        }

    remaining        = round(budget.total_budget - spent, 2)
    percentage_used  = round((spent / budget.total_budget) * 100, 1) if budget.total_budget > 0 else 0

    if percentage_used >= 100:
        status = "over_budget"
    elif percentage_used >= 80:
        status = "warning"
    else:
        status = "on_track"

    return {
        "month":           current_month,
        "total_budget":    budget.total_budget,
        "spent":           spent,
        "remaining":       remaining,
        "percentage_used": percentage_used,
        "status":          status,
        "message":         f"₹{remaining:,.0f} remaining this month" if remaining >= 0
                           else f"Over budget by ₹{abs(remaining):,.0f}"
    }


@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found.")

    db.delete(budget)
    db.commit()

    return {"message": f"Budget for {budget.month} deleted successfully."}