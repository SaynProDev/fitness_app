export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
export const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
export const safePct = (num, den) => (den > 0 ? (num / den) * 100 : 0);
export const formatDate = (date) => date.toLocaleDateString("fr-FR");
export const formatTime = (date) => date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

// Calculs nutrition
export const calculateBMR = (sex, age, height, weight) => (sex === "H" ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161);
export const calculateTDEE = (bmr, activityLevel) => {
  const f = { sedentaire: 1.2, leger: 1.375, modere: 1.55, eleve: 1.725, tres_eleve: 1.9 };
  return bmr * (f[activityLevel] ?? 1.2);
};
export const adjustCaloriesForGoal = (tdee, goal) => {
  const a = { seche: -0.15, seche_intensive: -0.25, maintenance: 0, prise: 0.1, prise_intensive: 0.2 };
  return Math.round(tdee * (1 + (a[goal] ?? 0)));
};
export const calculateMacros = (calories, weight, overrides = {}) => {
  const proteinTarget = overrides.protein_g ?? clamp(1.8 * weight, 1.6 * weight, 2.2 * weight);
  const fatTarget = overrides.fat_g ?? clamp(0.8 * weight, 0.6 * weight, 1.2 * weight);
  const proteinCals = proteinTarget * 4;
  const fatCals = fatTarget * 9;
  const carbCals = Math.max(0, calories - proteinCals - fatCals);
  const carbs = carbCals / 4;
  return { protein: Math.round(proteinTarget), fat: Math.round(fatTarget), carbs: Math.round(carbs) };
};
