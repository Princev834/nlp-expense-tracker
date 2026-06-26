
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});


export const parseExpense = (text) =>
  API.post('/expenses/parse', { text });

export const parseAndSave = (text) =>
  API.post('/expenses/parse-and-save', { text });

export const createExpense = (data) =>
  API.post('/expenses/', data);

export const getExpenses = (params = {}) =>
  API.get('/expenses/', { params });

export const getExpenseById = (id) =>
  API.get(`/expenses/${id}`);

export const updateExpense = (id, data) =>
  API.put(`/expenses/${id}`, data);

export const deleteExpense = (id) =>
  API.delete(`/expenses/${id}`);

export const getMonthlySummary = (month) =>
  API.get('/expenses/summary/monthly', { params: month ? { month } : {} });

export const getDailySummary = (month) =>
  API.get('/expenses/summary/daily', { params: month ? { month } : {} });

export const getInsights = () =>
  API.get('/expenses/insights');


export const getCategories = () =>
  API.get('/categories/');

export const createCategory = (data) =>
  API.post('/categories/', data);

export const updateCategory = (id, data) =>
  API.put(`/categories/${id}`, data);

export const deleteCategory = (id) =>
  API.delete(`/categories/${id}`);


export const getAllBudgets = () =>
  API.get('/budgets/');

export const setBudget = (month, total_budget) =>
  API.post('/budgets/', { month, total_budget });

export const getCurrentBudget = () =>
  API.get('/budgets/current');

export const deleteBudget = (id) =>
  API.delete(`/budgets/${id}`);