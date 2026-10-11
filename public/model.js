export const STORAGE_KEY = 'daily-calories-v1';
export const GOALS_KEY = 'daily-calorie-goals-v1';
export const DEFAULT_GOAL = 2700;
export function validGoal(value) { return validCalories(value) && Number(value) > 0; }
export function goalFor(goals, day) { return Object.hasOwn(goals,day) ? goals[day] : DEFAULT_GOAL; }
export function validateGoals(value) { return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.entries(value).every(([day, goal])=>/^\d{4}-\d{2}-\d{2}$/.test(day) && typeof goal === 'number' && validGoal(goal)); }
export function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function validCalories(value) { return String(value).trim() !== '' && /^\d+(\.\d{1,2})?$/.test(String(value).trim()) && Number.isFinite(Number(value)) && Number(value) <= 100000; }
export function totalFor(entries, day) { return Math.round(entries.filter(e=>e.day===day).reduce((sum,e)=>sum+e.calories,0)*100)/100; }
export function suggestionsFor(entries, query) {
  const unique = new Map();
  [...entries].sort((a,b)=>b.createdAt-a.createdAt).forEach(e=>{ const key=e.name.toLocaleLowerCase(); if (!unique.has(key)) unique.set(key,e); });
  const q=query.trim().toLocaleLowerCase();
  return [...unique.values()].filter(e=>e.name.toLocaleLowerCase().includes(q)).sort((a,b)=>Number(b.name.toLocaleLowerCase().startsWith(q))-Number(a.name.toLocaleLowerCase().startsWith(q))).slice(0,6);
}
export function validateEntries(value) { return Array.isArray(value) && value.every(e=>e && typeof e.id==='string' && typeof e.name==='string' && e.name.trim() && /^\d{4}-\d{2}-\d{2}$/.test(e.day) && typeof e.calories==='number' && validCalories(e.calories) && Number.isFinite(e.createdAt)); }
