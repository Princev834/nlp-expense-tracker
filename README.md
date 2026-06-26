<div align="center">

# 🧾 NLP Expense Tracker

### Log expenses in natural language. AI does the rest.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

**[Live Demo](https://your-app.vercel.app)** · **[API Docs](https://your-api.onrender.com/docs)**

</div>

---

## 🎯 The Problem It Solves

Traditional expense trackers force you to fill forms — category dropdowns, date pickers, amount fields. This app lets you log expenses the way you actually think about them:

```
"Spent ₹450 on Swiggy last Friday"       →  ₹450 · Food & Dining · June 14 · Swiggy
"Uber cab 200 this morning"               →  ₹200 · Transport · Today
"Netflix subscription 649"               →  ₹649 · Entertainment · Today
"Bought medicines from Apollo 350"       →  ₹350 · Health & Medical · Today · Apollo
```

The AI extracts the amount, category, date (including relative dates like "last Friday"), and merchant — all from a single sentence.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **NLP Input** | Type in English or Hinglish — Gemini AI parses it |
| 🔍 **Parse Preview** | See what AI understood before saving — with confidence % |
| 📊 **Dashboard** | Doughnut + line chart, month-over-month insights |
| 💡 **Smart Insights** | Top category, daily average, trend vs last month |
| 💰 **Budget Tracker** | Set monthly limits, colour-coded progress bar |
| 📤 **CSV Export** | Download all expenses as a spreadsheet (Excel-ready) |
| 🗓️ **Month Selector** | View analytics for any of the past 6 months |
| ⚡ **Auto API Docs** | Full interactive docs at `/docs` (FastAPI) |

---

## 🏗️ Architecture

```
nlp-expense-tracker/
│
├── backend/                    Python · FastAPI · SQLAlchemy
│   ├── main.py                 App entry point, CORS, startup seeding
│   ├── database.py             SQLite connection + session factory
│   ├── models.py               Expense, Category, Budget tables
│   ├── nlp_parser.py           Gemini AI integration + prompt engineering
│   ├── schemas/
│   │   └── expense_schema.py   Pydantic request/response models
│   └── routers/
│       ├── expenses.py         CRUD + NLP parse + analytics endpoints
│       ├── categories.py       Category management
│       └── budgets.py          Budget setting and status
│
└── frontend/                   React 18 · Vite · Chart.js
    └── src/
        ├── components/         Navbar, ExpenseInput, charts, cards
        ├── pages/              HomePage, DashboardPage
        ├── services/api.js     All Axios API calls (single source)
        └── utils/              Chart setup, category config, CSV export
```

---

## 🛠️ Tech Stack

**Backend**
- **Python 3.12** + **FastAPI** + **Uvicorn** — async REST API
- **SQLAlchemy ORM** + **SQLite** — database with zero configuration
- **Google Gemini 1.5 Flash** — NLP entity extraction via prompt engineering
- **Pydantic v2** — request/response validation with auto error messages

**Frontend**
- **React 18** + **Vite** — fast build and hot reload
- **Chart.js** + **react-chartjs-2** — doughnut and line charts
- **React Router v6** — client-side routing
- **Axios** — API communication with error handling
- **date-fns** — date formatting

---

## 🚀 Run Locally

### Prerequisites
- Python 3.12+, Node.js 20+
- Free Gemini API key → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR-USERNAME/nlp-expense-tracker.git
cd nlp-expense-tracker
```

### 2. Start the backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux

pip install -r requirements.txt

# Add your Gemini key
echo GEMINI_API_KEY=your_key_here > .env

uvicorn main:app --reload
# ✅ API: http://localhost:8000
# ✅ Docs: http://localhost:8000/docs
```

### 3. Start the frontend
```bash
# In a second terminal
cd frontend
npm install
npm run dev
# ✅ App: http://localhost:5173
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/expenses/parse` | Parse NL text — returns preview, does not save |
| `POST` | `/api/expenses/parse-and-save` | Parse and save in one request |
| `GET`  | `/api/expenses/` | All expenses (filter by month, category) |
| `GET`  | `/api/expenses/summary/monthly` | Category totals + percentages |
| `GET`  | `/api/expenses/summary/daily` | Day-by-day spending for charts |
| `GET`  | `/api/expenses/insights` | Trend, top category, daily average |
| `POST` | `/api/budgets/` | Set or update a monthly budget |
| `GET`  | `/api/budgets/current` | This month's budget vs actual spend |

Full interactive documentation at `/docs` (powered by FastAPI + Swagger UI).

---

## 🧠 NLP Engine Design

The parser (`nlp_parser.py`) uses **prompt engineering** to get reliable structured data from Gemini:

- Today's date and pre-computed relative dates ("yesterday" = exact ISO date) are injected into the prompt so the AI never guesses
- The exact category list from the database is embedded so the AI only returns valid categories
- `temperature=0.1` makes responses deterministic (not creative) — critical for data extraction
- A `find_closest_category()` fallback handles cases where the AI returns a slightly different category name
- All responses are validated with Pydantic before touching the database

---

## 📄 License

MIT © 2024 [Your Name]