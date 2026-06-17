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
    allow_origins=["http://localhost:5173"],
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


seed_default_categories()


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