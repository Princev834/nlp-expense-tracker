import os
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal

import models
from routers import expenses, categories, budgets


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="NLP Expense Tracker API",
    description="Log expenses using natural language. Powered by Google Gemini AI.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://nlp-expense-tracker-ebon.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining",     "color": "#FF6384", "icon": "🍔", "monthly_budget": 5000},
    {"name": "Transport",         "color": "#36A2EB", "icon": "🚗", "monthly_budget": 2000},
    {"name": "Shopping",          "color": "#FFCE56", "icon": "🛍️", "monthly_budget": 3000},
    {"name": "Entertainment",     "color": "#4BC0C0", "icon": "🎬", "monthly_budget": 1500},
    {"name": "Health & Medical",  "color": "#9966FF", "icon": "💊", "monthly_budget": 1000},
    {"name": "Bills & Utilities", "color": "#FF9F40", "icon": "🏠", "monthly_budget": 4000},
    {"name": "Education",         "color": "#E7E9ED", "icon": "📚", "monthly_budget": 2000},
    {"name": "Groceries",         "color": "#71B37C", "icon": "🛒", "monthly_budget": 3000},
    {"name": "Travel",            "color": "#F17171", "icon": "✈️", "monthly_budget": None},
    {"name": "Other",             "color": "#C9CBCF", "icon": "💰", "monthly_budget": None},
]


def seed_default_categories():
    db = SessionLocal()
    try:
        for cat_data in DEFAULT_CATEGORIES:
            existing = db.query(models.Category).filter(
                models.Category.name == cat_data["name"]
            ).first()

            if not existing:
                category = models.Category(**cat_data)
                db.add(category)

        db.commit()
        print("✅ Default categories seeded successfully.")
    except Exception as e:
        print(f"❌ Error seeding categories: {e}")
        db.rollback()
    finally:
        db.close()

def seed_demo_data():
    from datetime import date, timedelta
    db = SessionLocal()
    try:
        db.query(models.Expense).delete()
        db.query(models.Budget).delete()
        db.commit()

        today = date.today()

        sample_expenses = [
            {"amount": 320,  "category": "Food & Dining",    "description": "food delivery from Swiggy",    "merchant": "Swiggy",   "days_ago": 0},
            {"amount": 480,  "category": "Food & Dining",    "description": "pizza order from Dominos",     "merchant": "Dominos",  "days_ago": 2},
            {"amount": 150,  "category": "Food & Dining",    "description": "chai and snacks",              "merchant": None,       "days_ago": 3},
            {"amount": 620,  "category": "Food & Dining",    "description": "dinner at restaurant",         "merchant": None,       "days_ago": 6},
            {"amount": 180,  "category": "Transport",        "description": "Uber cab to college",          "merchant": "Uber",     "days_ago": 1},
            {"amount": 90,   "category": "Transport",        "description": "auto rickshaw ride",            "merchant": None,       "days_ago": 4},
            {"amount": 200,  "category": "Transport",        "description": "metro card recharge",          "merchant": None,       "days_ago": 7},
            {"amount": 1450, "category": "Shopping",         "description": "Amazon online shopping",       "merchant": "Amazon",   "days_ago": 3},
            {"amount": 850,  "category": "Shopping",         "description": "clothes from Myntra",          "merchant": "Myntra",   "days_ago": 9},
            {"amount": 649,  "category": "Entertainment",    "description": "Netflix monthly subscription", "merchant": "Netflix",  "days_ago": 1},
            {"amount": 179,  "category": "Entertainment",    "description": "Spotify premium subscription", "merchant": "Spotify",  "days_ago": 5},
            {"amount": 350,  "category": "Health & Medical", "description": "medicines from Apollo",        "merchant": "Apollo",   "days_ago": 2},
            {"amount": 800,  "category": "Health & Medical", "description": "doctor consultation fee",      "merchant": None,       "days_ago": 8},
            {"amount": 1200, "category": "Bills & Utilities","description": "electricity bill payment",     "merchant": None,       "days_ago": 5},
            {"amount": 299,  "category": "Bills & Utilities","description": "mobile recharge",              "merchant": None,       "days_ago": 0},
            {"amount": 1299, "category": "Education",        "description": "Udemy course purchase",        "merchant": "Udemy",    "days_ago": 4},
            {"amount": 890,  "category": "Groceries",        "description": "weekly groceries from DMart",  "merchant": "DMart",    "days_ago": 6},
            {"amount": 340,  "category": "Groceries",        "description": "fruits and vegetables",        "merchant": None,       "days_ago": 2},
        ]

        for item in sample_expenses:
            category = db.query(models.Category).filter(
                models.Category.name == item["category"]
            ).first()

            expense = models.Expense(
                raw_text    = None,
                amount      = item["amount"],
                category    = item["category"],
                date        = today - timedelta(days=item["days_ago"]),
                description = item["description"],
                merchant    = item["merchant"],
                category_id = category.id if category else None,
            )
            db.add(expense)

        current_month = today.strftime("%Y-%m")
        budget = models.Budget(month=current_month, total_budget=15000)
        db.add(budget)

        db.commit()
        print("✅ Demo data seeded successfully.")
    except Exception as e:
        print(f"❌ Demo seed error: {e}")
        db.rollback()
    finally:
        db.close()


seed_default_categories()

seed_demo_data()

def schedule_demo_reset(interval_hours: int = 6):
    import time
    interval_seconds = interval_hours * 60 * 60
    while True:
        time.sleep(interval_seconds)
        print(f"⏰ Auto-resetting demo data...")
        seed_demo_data()

reset_thread = threading.Thread(
    target=schedule_demo_reset,
    args=(6,),
    daemon=True
)
reset_thread.start()


DEMO_SECRET = os.getenv("DEMO_SECRET", "Princev834reset")

@app.get("/api/demo/reset")
def manual_reset(secret: str):
    if secret != DEMO_SECRET:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Invalid secret key.")
    seed_demo_data()
    return {"message": "Demo data reset successfully ✅"}


app.include_router(expenses.router,   prefix="/api/expenses",   tags=["Expenses"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(budgets.router,    prefix="/api/budgets",    tags=["Budgets"])


@app.get("/")
def root():
    return {
        "message": "NLP Expense Tracker API is running ✅",
        "docs":    "Visit http://localhost:8000/docs to explore the API",
        "status":  "ok"
    }