
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from collections import defaultdict
from datetime import date, timedelta
from typing import Optional, List

from database import get_db
from schemas.expense_schema import (
    NLPInput, ExpenseCreate, ExpenseResponse,
    MonthlySummary, CategorySummary, DailyPoint, InsightResponse
)
from nlp_parser import parse_expense
import models

router = APIRouter()


@router.post("/parse")
def parse_expense_text(payload: NLPInput, db: Session = Depends(get_db)):
    db_categories   = db.query(models.Category).all()
    category_names  = [cat.name for cat in db_categories] or None
    result          = parse_expense(text=payload.text, categories=category_names)

    if not result["success"]:
        raise HTTPException(
            status_code=422,
            detail={
                "message": result["error"],
                "hint":    "Try including an amount. Example: 'Spent ₹300 on food yesterday'"
            }
        )
    return result


@router.post("/parse-and-save", response_model=ExpenseResponse, status_code=201)
def parse_and_save(payload: NLPInput, db: Session = Depends(get_db)):

    db_categories  = db.query(models.Category).all()
    category_names = [cat.name for cat in db_categories] or None

    result = parse_expense(text=payload.text, categories=category_names)

    if not result["success"]:
        raise HTTPException(status_code=422, detail=result["error"])

    category = db.query(models.Category).filter(
        models.Category.name == result["category"]
    ).first()

    expense_date = date.fromisoformat(result["date"])

    new_expense = models.Expense(
        raw_text    = result["raw_text"],
        amount      = result["amount"],
        category    = result["category"],
        date        = expense_date,
        description = result["description"],
        merchant    = result["merchant"],
        category_id = category.id if category else None,
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


@router.post("/", response_model=ExpenseResponse, status_code=201)
def create_expense(expense_data: ExpenseCreate, db: Session = Depends(get_db)):

    if expense_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    category = db.query(models.Category).filter(
        models.Category.name == expense_data.category
    ).first()

    new_expense = models.Expense(
        raw_text    = expense_data.raw_text,
        amount      = expense_data.amount,
        category    = expense_data.category,
        date        = expense_data.date,
        description = expense_data.description,
        merchant    = expense_data.merchant,
        category_id = category.id if category else None,
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    month:    Optional[str] = Query(None, description="Filter by month: YYYY-MM"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    limit:    int           = Query(100,  description="Max results to return"),
    offset:   int           = Query(0,    description="Skip N results for pagination"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Expense)

    if month:
        query = query.filter(
            func.strftime("%Y-%m", models.Expense.date) == month
        )

    if category:
        query = query.filter(models.Expense.category == category)

    expenses = query.order_by(
        desc(models.Expense.date),
        desc(models.Expense.created_at)
    ).offset(offset).limit(limit).all()

    return expenses


@router.get("/summary/monthly")
def get_monthly_summary(
    month: str = Query(None, description="Month to summarise: YYYY-MM"),
    db: Session = Depends(get_db)
):
    if not month:
        month = date.today().strftime("%Y-%m")

    expenses = db.query(models.Expense).filter(
        func.strftime("%Y-%m", models.Expense.date) == month
    ).all()

    if not expenses:
        return MonthlySummary(
            month=month, total=0.0,
            by_category=[], budget=None, remaining=None
        )

    total = sum(e.amount for e in expenses)

    cat_data: dict = defaultdict(lambda: {"total": 0.0, "count": 0})
    for e in expenses:
        cat_data[e.category]["total"] += e.amount
        cat_data[e.category]["count"] += 1

    all_categories = {c.name: c for c in db.query(models.Category).all()}

    by_category = []
    for cat_name, data in cat_data.items():
        meta = all_categories.get(cat_name)
        by_category.append(CategorySummary(
            category   = cat_name,
            total      = round(data["total"], 2),
            count      = data["count"],
            color      = meta.color if meta else "#C9CBCF",
            icon       = meta.icon  if meta else "💰",
            percentage = round((data["total"] / total) * 100, 1)
        ))

    by_category.sort(key=lambda x: x.total, reverse=True)

    budget_row = db.query(models.Budget).filter(
        models.Budget.month == month
    ).first()

    budget    = budget_row.total_budget if budget_row else None
    remaining = round(budget - total, 2) if budget else None

    return MonthlySummary(
        month       = month,
        total       = round(total, 2),
        by_category = by_category,
        budget      = budget,
        remaining   = remaining,
    )


@router.get("/summary/daily")
def get_daily_summary(
    month: str = Query(None, description="Month for daily data: YYYY-MM"),
    db: Session = Depends(get_db)
):
    if not month:
        month = date.today().strftime("%Y-%m")

    rows = db.query(
        func.strftime("%Y-%m-%d", models.Expense.date).label("day"),
        func.sum(models.Expense.amount).label("total")
    ).filter(
        func.strftime("%Y-%m", models.Expense.date) == month
    ).group_by(
        func.strftime("%Y-%m-%d", models.Expense.date)
    ).order_by("day").all()

    return [DailyPoint(date=row.day, total=round(row.total, 2)) for row in rows]


@router.get("/insights")
def get_insights(db: Session = Depends(get_db)):
    today         = date.today()
    current_month = today.strftime("%Y-%m")

    first_of_this_month = today.replace(day=1)
    last_month          = (first_of_this_month - timedelta(days=1)).strftime("%Y-%m")

    current_expenses = db.query(models.Expense).filter(
        func.strftime("%Y-%m", models.Expense.date) == current_month
    ).all()
    current_total = sum(e.amount for e in current_expenses)

    last_expenses = db.query(models.Expense).filter(
        func.strftime("%Y-%m", models.Expense.date) == last_month
    ).all()
    last_total = sum(e.amount for e in last_expenses)

    cat_totals: dict = defaultdict(float)
    for e in current_expenses:
        cat_totals[e.category] += e.amount

    if cat_totals:
        top_category  = max(cat_totals, key=cat_totals.get)
        top_amount    = cat_totals[top_category]
    else:
        top_category  = "None"
        top_amount    = 0.0

    days_elapsed = max(today.day, 1)
    avg_daily    = current_total / days_elapsed

    daily_sums: dict = defaultdict(float)
    for e in current_expenses:
        daily_sums[str(e.date)] += e.amount
    days_over = sum(1 for t in daily_sums.values() if t > avg_daily * 1.5)

    if last_total == 0:
        trend = "First month of tracking! Great start 🚀"
    elif current_total < last_total:
        pct   = ((last_total - current_total) / last_total) * 100
        trend = f"You're spending {pct:.0f}% less than last month 🎉"
    else:
        pct   = ((current_total - last_total) / last_total) * 100
        trend = f"Spending is up {pct:.0f}% compared to last month 📈"

    return InsightResponse(
        current_month_total = round(current_total, 2),
        last_month_total    = round(last_total, 2),
        highest_category    = top_category,
        highest_amount      = round(top_amount, 2),
        average_daily       = round(avg_daily, 2),
        days_over_budget    = days_over,
        trend_message       = trend,
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail=f"Expense with ID {expense_id} not found."
        )
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id:   int,
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail=f"Expense with ID {expense_id} not found."
        )

    if expense_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    expense.amount      = expense_data.amount
    expense.category    = expense_data.category
    expense.date        = expense_data.date
    expense.description = expense_data.description
    expense.merchant    = expense_data.merchant

    category            = db.query(models.Category).filter(
        models.Category.name == expense_data.category
    ).first()
    expense.category_id = category.id if category else None

    db.commit()
    db.refresh(expense)

    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail=f"Expense with ID {expense_id} not found."
        )

    db.delete(expense)
    db.commit()

    return {"message": f"Expense {expense_id} deleted successfully.", "id": expense_id}