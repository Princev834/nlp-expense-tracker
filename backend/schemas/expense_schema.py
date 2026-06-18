from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class NLPInput(BaseModel):
    text: str        


class ParsedExpense(BaseModel):
    amount:      float
    category:    str
    date:        date
    description: str
    merchant:    Optional[str] = None
    confidence:  float


class ExpenseCreate(BaseModel):
    raw_text:    Optional[str]  = None
    amount:      float
    category:    str
    date:        date
    description: Optional[str] = None
    merchant:    Optional[str] = None


class ExpenseResponse(BaseModel):
    id:          int
    raw_text:    Optional[str]
    amount:      float
    category:    str
    date:        date
    description: Optional[str]
    merchant:    Optional[str]
    created_at:  datetime

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name:           str
    color:          Optional[str]  = "#6366F1"
    icon:           Optional[str]  = "💰"
    monthly_budget: Optional[float] = None


class CategoryResponse(BaseModel):
    id:             int
    name:           str
    color:          str
    icon:           str
    monthly_budget: Optional[float]

    class Config:
        from_attributes = True


class BudgetCreate(BaseModel):
    month:        str
    total_budget: float


class BudgetResponse(BaseModel):
    id:           int
    month:        str
    total_budget: float
    created_at:   datetime

    class Config:
        from_attributes = True


class CategorySummary(BaseModel):
    category:   str
    total:      float
    count:      int
    color:      str
    icon:       str
    percentage: float


class MonthlySummary(BaseModel):
    month:       str
    total:       float
    by_category: List[CategorySummary]
    budget:      Optional[float]
    remaining:   Optional[float]


class DailyPoint(BaseModel):
    date:  str
    total: float


class InsightResponse(BaseModel):
    current_month_total: float
    last_month_total:    float
    highest_category:    str
    highest_amount:      float
    average_daily:       float
    days_over_budget:    int
    trend_message:       str