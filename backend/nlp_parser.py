
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import json
import re
from datetime import date, timedelta

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("❌ GEMINI_API_KEY not found in .env file. Please add it.")

client = genai.Client(api_key=gemini_api_key)

MODEL = "gemini-3.1-flash-lite"

DEFAULT_CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Shopping",
    "Entertainment",
    "Health & Medical",
    "Bills & Utilities",
    "Education",
    "Groceries",
    "Travel",
    "Other"
]


def build_prompt(text: str, categories: list) -> str:
    today = date.today()

    yesterday      = today - timedelta(days=1)
    two_days_ago   = today - timedelta(days=2)
    three_days_ago = today - timedelta(days=3)
    one_week_ago   = today - timedelta(days=7)

    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    last_days = {}
    for i, day_name in enumerate(day_names):
        days_back = (today.weekday() - i) % 7
        if days_back == 0:
            days_back = 7
        last_days[day_name] = (today - timedelta(days=days_back)).strftime("%Y-%m-%d")

    last_days_formatted = "\n".join(
        f'   - "last {day}" = {dt}' for day, dt in last_days.items()
    )
    categories_list = "\n".join(f"   - {cat}" for cat in categories)

    prompt = f"""You are an intelligent expense parsing assistant for an Indian personal finance app.
Your task is to extract structured expense data from natural language text in English, Hinglish, or Hindi.

═══════════════════════════════════════════════════════════
TODAY'S DATE: {today.strftime("%A, %d %B %Y")}
═══════════════════════════════════════════════════════════

AVAILABLE CATEGORIES (you MUST pick from ONLY this list):
{categories_list}

USER INPUT: "{text}"

═══════════════════════════════════════════════════════════
EXTRACTION RULES
═══════════════════════════════════════════════════════════

1. AMOUNT (required — if missing, return error):
   - Remove currency symbols: ₹  Rs  rs  $  £  €
   - Remove commas: ₹1,500 → 1500.0
   - Handle shorthand: 1k → 1000, 1.5k → 1500, 2.5k → 2500
   - Handle lakhs: 1L → 100000, 1.5L → 150000
   - Result must be a positive float

2. DATE (use today if not mentioned):
   - "today"                 = {today.strftime("%Y-%m-%d")}
   - "yesterday"             = {yesterday.strftime("%Y-%m-%d")}
   - "day before yesterday"  = {two_days_ago.strftime("%Y-%m-%d")}
   - "2 days ago"            = {two_days_ago.strftime("%Y-%m-%d")}
   - "3 days ago"            = {three_days_ago.strftime("%Y-%m-%d")}
   - "a week ago"            = {one_week_ago.strftime("%Y-%m-%d")}
{last_days_formatted}
   - "this morning / evening / night" = {today.strftime("%Y-%m-%d")}
   - Specific dates like "June 5" or "5th June" → use year {today.year}
   - Always return date as "YYYY-MM-DD" string

3. CATEGORY (pick the single best match from the list):
   Food & Dining    → food, eat, lunch, dinner, breakfast, chai, coffee, snack,
                      restaurant, cafe, zomato, swiggy, blinkit, dominos, pizza
   Transport        → auto, cab, uber, ola, rapido, metro, bus, petrol, fuel, toll
   Shopping         → amazon, flipkart, clothes, shoes, mobile, electronics, mall
   Entertainment    → movie, pvr, inox, netflix, prime, spotify, concert, game
   Health & Medical → doctor, clinic, hospital, medicine, pharmacy, apollo
   Bills & Utilities → electricity, rent, wifi, mobile recharge, broadband, gas
   Education        → course, udemy, books, tuition, fees, coaching, notebook
   Groceries        → vegetables, fruits, milk, eggs, grocery, dmart, zepto
   Travel           → flight, indigo, hotel, oyo, booking, makemytrip, trip
   Other            → anything that does not fit above

4. MERCHANT (optional — only if clearly named):
   - App/brand names: Swiggy, Amazon, Uber, Netflix, Zomato, Apollo
   - Return null if no merchant is mentioned

5. DESCRIPTION: 3 to 6 words summarising what was purchased

6. CONFIDENCE (0.0 to 1.0):
   - 0.9–1.0: clear expense, amount and category obvious
   - 0.7–0.9: expense clear but some details inferred
   - below 0.5: very uncertain — return error instead

═══════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════

Return ONLY a raw JSON object. No markdown. No explanation. No extra text.

If the text describes a valid expense:
{{
  "amount": 300.0,
  "category": "Food & Dining",
  "date": "2024-06-16",
  "description": "food delivery from Swiggy",
  "merchant": "Swiggy",
  "confidence": 0.95
}}

If you cannot find a valid amount or the text is not an expense:
{{
  "error": "brief reason why parsing failed",
  "confidence": 0.0
}}"""

    return prompt


def find_closest_category(returned_category: str, valid_categories: list) -> str:
    returned_lower = returned_category.lower()

    for cat in valid_categories:
        if cat.lower() == returned_lower:
            return cat

    for cat in valid_categories:
        if returned_lower in cat.lower() or cat.lower() in returned_lower:
            return cat

    keyword_map = {
        "food": "Food & Dining", "dining": "Food & Dining",
        "transport": "Transport", "travel": "Travel",
        "shop": "Shopping", "entertain": "Entertainment",
        "health": "Health & Medical", "medical": "Health & Medical",
        "bill": "Bills & Utilities", "utility": "Bills & Utilities",
        "educat": "Education", "grocer": "Groceries",
    }
    for keyword, category in keyword_map.items():
        if keyword in returned_lower and category in valid_categories:
            return category

    return "Other"


def parse_expense(text: str, categories: list = None) -> dict:

    if not text or not text.strip():
        return {"success": False, "error": "Input text is empty."}

    text = text.strip()

    if len(text) < 3:
        return {"success": False, "error": "Input text is too short."}

    if len(text) > 500:
        return {"success": False, "error": "Input text is too long (max 500 characters)."}

    if not categories:
        categories = DEFAULT_CATEGORIES

    prompt = build_prompt(text, categories)

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=512,
            )
        )

        if response.text is None:
            return {"success": False, "error": "AI response was blocked by safety filters."}

        raw_response = response.text.strip()

        raw_response = re.sub(r"```json\s*", "", raw_response)
        raw_response = re.sub(r"```\s*",     "", raw_response)
        raw_response = raw_response.strip()

        parsed = json.loads(raw_response)

        if "error" in parsed:
            return {
                "success":    False,
                "error":      parsed["error"],
                "confidence": parsed.get("confidence", 0.0)
            }

        required_fields = ["amount", "category", "date", "description", "confidence"]
        for field in required_fields:
            if field not in parsed:
                return {"success": False, "error": f"AI response missing field: '{field}'"}

        parsed["amount"]     = float(parsed["amount"])
        parsed["confidence"] = float(parsed["confidence"])

        if parsed["amount"] <= 0:
            return {"success": False, "error": "Amount must be greater than zero."}

        if parsed["amount"] > 10_000_000:
            return {"success": False, "error": "Amount seems unrealistically large."}

        if parsed["category"] not in categories:
            parsed["category"] = find_closest_category(parsed["category"], categories)

        if "merchant" not in parsed or parsed["merchant"] == "":
            parsed["merchant"] = None

        return {
            "success":     True,
            "amount":      parsed["amount"],
            "category":    parsed["category"],
            "date":        parsed["date"],
            "description": parsed["description"],
            "merchant":    parsed["merchant"],
            "confidence":  parsed["confidence"],
            "raw_text":    text,
        }

    except json.JSONDecodeError:
        return {
            "success": False,
            "error":   "AI returned an unexpected format. Try rephrasing your input."
        }
    except Exception as e:
        error_message = str(e)
        if "API_KEY" in error_message.upper() or "401" in error_message:
            return {"success": False, "error": "Invalid Gemini API key. Check your .env file."}
        if "quota" in error_message.lower() or "429" in error_message:
            return {"success": False, "error": "API rate limit reached. Wait a moment and try again."}
        return {"success": False, "error": f"Parsing failed: {error_message}"}