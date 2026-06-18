
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.expense_schema import NLPInput
from nlp_parser import parse_expense
import models

router = APIRouter()


@router.post("/parse")
def parse_expense_text(payload: NLPInput, db: Session = Depends(get_db)):

    db_categories = db.query(models.Category).all()
    category_names = [cat.name for cat in db_categories]

    if not category_names:
        category_names = None

    result = parse_expense(text=payload.text, categories=category_names)

    if not result["success"]:
        raise HTTPException(
            status_code=422,
            detail={
                "message": result["error"],
                "hint":    "Try including an amount — e.g. 'Spent ₹300 on food'"
            }
        )

    return result


@router.get("/")
def get_expenses():
    return []