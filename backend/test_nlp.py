from nlp_parser import parse_expense
import json


test_cases = [
    "Spent ₹300 on food yesterday",
    "Paid 500 for Uber this morning",

    "Ordered Dominos pizza for ₹450 last night",
    "Amazon shopping ₹1,500 yesterday",

    "Bought clothes for 2.5k last Saturday",
    "Netflix subscription 649 today",

    "Paid electricity bill ₹1,200",
    "Mobile recharge 299 today",

    "Doctor consultation fee 800 yesterday",
    "Bought medicines for ₹350 from Apollo",

    "Paid Udemy course fees 1499",
    "Bought notebooks and pens for 250",

    "Booked Indigo flight for 4500",
    "OYO hotel stay ₹2,000 last Friday",

    "coffee 80",
    "spent some money on food",
    "₹0 on transport",
]

print("=" * 65)
print("   NLP EXPENSE PARSER — TEST RESULTS")
print("=" * 65)

passed = 0
failed = 0

for i, test_input in enumerate(test_cases, 1):
    print(f"\nTest {i:02d}: \"{test_input}\"")
    print("-" * 65)

    result = parse_expense(test_input)

    if result["success"]:
        print(f"  ✅ SUCCESS  (confidence: {result['confidence']:.0%})")
        print(f"  Amount:      ₹{result['amount']:.2f}")
        print(f"  Category:    {result['category']}")
        print(f"  Date:        {result['date']}")
        print(f"  Description: {result['description']}")
        if result["merchant"]:
            print(f"  Merchant:    {result['merchant']}")
        passed += 1
    else:
        print(f"  ❌ FAILED: {result['error']}")
        if "no amount" in test_input.lower() or "₹0" in test_input:
            print("  (This failure is expected — the input has no valid amount)")
        failed += 1

print("\n" + "=" * 65)
print(f"  RESULTS: {passed} passed, {failed} failed out of {len(test_cases)} tests")
print("=" * 65)

if passed >= len(test_cases) - 2:
    print("\n  🎉 NLP Engine is working correctly! Ready for Part 4.")
else:
    print("\n  ⚠️  Some unexpected failures. Check your GEMINI_API_KEY in .env")