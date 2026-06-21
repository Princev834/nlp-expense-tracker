export const CATEGORY_META = {
  "Food & Dining":    { color: "#FF6384", bg: "rgba(255,99,132,0.12)",  icon: "🍔" },
  "Transport":        { color: "#36A2EB", bg: "rgba(54,162,235,0.12)",  icon: "🚗" },
  "Shopping":         { color: "#FFCE56", bg: "rgba(255,206,86,0.12)",  icon: "🛍️" },
  "Entertainment":    { color: "#4BC0C0", bg: "rgba(75,192,192,0.12)",  icon: "🎬" },
  "Health & Medical": { color: "#9966FF", bg: "rgba(153,102,255,0.12)", icon: "💊" },
  "Bills & Utilities":{ color: "#FF9F40", bg: "rgba(255,159,64,0.12)",  icon: "🏠" },
  "Education":        { color: "#A8D8A8", bg: "rgba(168,216,168,0.12)", icon: "📚" },
  "Groceries":        { color: "#71B37C", bg: "rgba(113,179,124,0.12)", icon: "🛒" },
  "Travel":           { color: "#F17171", bg: "rgba(241,113,113,0.12)", icon: "✈️" },
  "Other":            { color: "#C9CBCF", bg: "rgba(201,203,207,0.12)", icon: "💰" },
};

export function getCategoryMeta(categoryName) {
  return CATEGORY_META[categoryName] ?? CATEGORY_META["Other"];
}