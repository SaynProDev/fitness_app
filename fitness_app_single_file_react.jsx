import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import { Home, Apple, Dumbbell, Settings, BarChart3, Plus, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

// ================================
// Helpers & Seed data
// ================================

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
const safePct = (num, den) => (den > 0 ? (num / den) * 100 : 0);
const formatDate = (date) => date.toLocaleDateString("fr-FR");
const formatTime = (date) => date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const SEED_EXERCISES = [
  { id: "ex1", name: "Développé couché", muscle_group: "Pectoraux" },
  { id: "ex2", name: "Squat", muscle_group: "Jambes" },
  { id: "ex3", name: "Soulevé de terre", muscle_group: "Dos" },
  { id: "ex4", name: "Rowing barre", muscle_group: "Dos" },
  { id: "ex5", name: "Tractions", muscle_group: "Dos" },
  { id: "ex6", name: "Développé militaire", muscle_group: "Épaules" },
  { id: "ex7", name: "Fentes", muscle_group: "Jambes" },
  { id: "ex8", name: "Curl biceps", muscle_group: "Biceps" },
  { id: "ex9", name: "Extension triceps", muscle_group: "Triceps" }
];

const SEED_FOODS = [
  { id: "f1", name: "Riz blanc", kcal_per_100g: 130, protein_per_100g: 2.7, carb_per_100g: 28, fat_per_100g: 0.3, is_custom: false },
  { id: "f2", name: "Poulet cuit", kcal_per_100g: 165, protein_per_100g: 31, carb_per_100g: 0, fat_per_100g: 3.6, is_custom: false },
  { id: "f3", name: "Amandes", kcal_per_100g: 579, protein_per_100g: 21, carb_per_100g: 22, fat_per_100g: 50, is_custom: false },
  { id: "f4", name: "Œuf", kcal_per_100g: 155, protein_per_100g: 13, carb_per_100g: 1.1, fat_per_100g: 11, is_custom: false },
  { id: "f5", name: "Banane", kcal_per_100g: 89, protein_per_100g: 1.1, carb_per_100g: 23, fat_per_100g: 0.3, is_custom: false },
  { id: "f6", name: "Avoine", kcal_per_100g: 389, protein_per_100g: 16.9, carb_per_100g: 66, fat_per_100g: 6.9, is_custom: false }
];

const SEED_WORKOUT_TEMPLATES = [
  {
    id: "wt1",
    name: "Pecs/Triceps",
    items: [
      { exercise_type_id: "ex1", target_sets: 4, target_reps: 8, rest_sec: 120 },
      { exercise_type_id: "ex9", target_sets: 3, target_reps: 12, rest_sec: 90 }
    ]
  },
  {
    id: "wt2",
    name: "Dos/Biceps",
    items: [
      { exercise_type_id: "ex5", target_sets: 4, target_reps: 6, rest_sec: 120 },
      { exercise_type_id: "ex4", target_sets: 4, target_reps: 10, rest_sec: 90 },
      { exercise_type_id: "ex8", target_sets: 3, target_reps: 12, rest_sec: 60 }
    ]
  },
  {
    id: "wt3",
    name: "Jambes/Épaules",
    items: [
      { exercise_type_id: "ex2", target_sets: 5, target_reps: 5, rest_sec: 180 },
      { exercise_type_id: "ex7", target_sets: 3, target_reps: 10, rest_sec: 90 },
      { exercise_type_id: "ex6", target_sets: 4, target_reps: 8, rest_sec: 120 }
    ]
  }
];

// Calculs nutrition
const calculateBMR = (sex, age, height, weight) => (sex === "H" ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161);
const calculateTDEE = (bmr, activityLevel) => {
  const f = { sedentaire: 1.2, leger: 1.375, modere: 1.55, eleve: 1.725, tres_eleve: 1.9 };
  return bmr * (f[activityLevel] ?? 1.2);
};
const adjustCaloriesForGoal = (tdee, goal) => {
  const a = { seche: -0.15, seche_intensive: -0.25, maintenance: 0, prise: 0.1, prise_intensive: 0.2 };
  return Math.round(tdee * (1 + (a[goal] ?? 0)));
};
const calculateMacros = (calories, weight, overrides = {}) => {
  const proteinTarget = overrides.protein_g ?? clamp(1.8 * weight, 1.6 * weight, 2.2 * weight);
  const fatTarget = overrides.fat_g ?? clamp(0.8 * weight, 0.6 * weight, 1.2 * weight);
  const proteinCals = proteinTarget * 4;
  const fatCals = fatTarget * 9;
  const carbCals = Math.max(0, calories - proteinCals - fatCals);
  const carbs = carbCals / 4;
  return { protein: Math.round(proteinTarget), fat: Math.round(fatTarget), carbs: Math.round(carbs) };
};

// ================================
// UI Primitives
// ================================

const Card = ({ children, className = "", onClick }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${className}`} onClick={onClick}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", icon, className = "", disabled }) => {
  const base = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-orange-600 text-white hover:bg-orange-700"
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

const ProgressCircle = ({ percentage, size = 80, color = "#3B82F6", strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = `${Math.min(100, Math.max(0, percentage)) / 100 * circumference} ${circumference}`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={dash} strokeLinecap="round" className="transition-all duration-300" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-800">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><XCircle size={20} className="text-gray-500" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// ================================
// Screens
// ================================

const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ sex: "", age: "", height_cm: "", current_weight_kg: "", goal: "", activity_level: "", consent: false });

  const steps = [
    {
      title: "Informations personnelles",
      fields: [
        { key: "sex", label: "Sexe", type: "select", options: [ { value: "H", label: "Homme" }, { value: "F", label: "Femme" }, { value: "Autre", label: "Autre" } ] },
        { key: "age", label: "Âge (années)", type: "number" },
        { key: "height_cm", label: "Taille (cm)", type: "number" },
        { key: "current_weight_kg", label: "Poids (kg)", type: "number" }
      ]
    },
    {
      title: "Objectifs",
      fields: [
        { key: "goal", label: "Objectif", type: "select", options: [
          { value: "seche", label: "Sèche" }, { value: "seche_intensive", label: "Sèche intensive" }, { value: "maintenance", label: "Maintenance" }, { value: "prise", label: "Prise de masse" }, { value: "prise_intensive", label: "Prise intensive" }
        ] },
        { key: "activity_level", label: "Niveau d'activité", type: "select", options: [
          { value: "sedentaire", label: "Sédentaire" }, { value: "leger", label: "Léger" }, { value: "modere", label: "Modéré" }, { value: "eleve", label: "Élevé" }, { value: "tres_eleve", label: "Très élevé" }
        ] }
      ]
    }
  ];

  const currentStep = steps[step];
  const isStepValid = () => currentStep.fields.every((f) => formData[f.key] !== "" && formData[f.key] !== undefined);

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete({ ...formData, age: parseInt(formData.age), height_cm: parseFloat(formData.height_cm), current_weight_kg: parseFloat(formData.current_weight_kg) });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration initiale</h1>
          <p className="text-gray-600">Étape {step + 1} sur {steps.length}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-4">{currentStep.title}</h2>
          {currentStep.fields.map((field) => (
            <div key={field.key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              {field.type === "select" ? (
                <div className="grid grid-cols-1 gap-2">
                  {field.options.map((opt) => (
                    <button key={opt.value} type="button" className={`p-3 text-left rounded-lg border transition-all ${formData[field.key] === opt.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`} onClick={() => setFormData({ ...formData, [field.key]: opt.value })}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input type={field.type === "number" ? "number" : "text"} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" value={formData[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} placeholder={`Entrez votre ${field.label.toLowerCase()}`} />
              )}
            </div>
          ))}

          {step === steps.length - 1 && (
            <div className="mb-6">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked={formData.consent} onChange={(e) => setFormData({ ...formData, consent: e.target.checked })} />
                <span className="text-sm text-gray-600">J'accepte le stockage local de mes données et consens au traitement RGPD</span>
              </label>
            </div>
          )}

          <Button onClick={handleNext} disabled={!isStepValid() || (step === steps.length - 1 && !formData.consent)} className="w-full">
            {step < steps.length - 1 ? "Suivant" : "Terminer"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

const MacroCard = ({ label, current, target, unit = "g", color }) => (
  <Card className="text-center min-w-24">
    <div className="text-xs text-gray-600 mb-1">{label}</div>
    <div className="text-sm font-semibold mb-2" style={{ color }}>{Math.round(current)}{unit} / {target}{unit}</div>
    <ProgressCircle percentage={safePct(current, target)} size={50} color={color} strokeWidth={4} />
  </Card>
);

const DashboardScreen = ({ user, nutrition, workouts, weight, onAddFood, onAddWeight, onStartWorkout }) => {
  const today = new Date().toISOString().split("T")[0];
  const todayNutrition = nutrition.filter((e) => e.date === today);
  const todayWorkout = workouts.planned.find((s) => s.date_time.split("T")[0] === today && s.status === "planifiee");
  const completedWorkout = workouts.planned.find((s) => s.date_time.split("T")[0] === today && s.status === "faite");

  const totalNutrition = todayNutrition.reduce((acc, e) => ({ kcal: acc.kcal + e.kcal, protein_g: acc.protein_g + e.protein_g, carb_g: acc.carb_g + e.carb_g, fat_g: acc.fat_g + e.fat_g }), { kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0 });

  const bmr = calculateBMR(user.sex, user.age, user.height_cm, user.current_weight_kg);
  const tdee = calculateTDEE(bmr, user.activity_level);
  const targetCalories = adjustCaloriesForGoal(tdee, user.goal);
  const targetMacros = calculateMacros(targetCalories, user.current_weight_kg, user.macro_overrides);

  const latestWeight = weight.length > 0 ? weight[weight.length - 1].weight_kg : user.current_weight_kg;
  const weightData = weight.slice(-7).map((w, i) => ({ day: i + 1, weight: w.weight_kg }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Bonjour ! 👋</h1>
        <p className="text-gray-600">{formatDate(new Date())}</p>
      </div>

      {/* Nutrition */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Apple size={24} className="text-green-600" />
          <h2 className="text-lg font-semibold">Nutrition du jour</h2>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(totalNutrition.kcal)} <span className="text-base font-normal text-gray-600">/ {targetCalories} kcal</span></p>
          </div>
          <ProgressCircle percentage={safePct(totalNutrition.kcal, targetCalories)} size={70} color="#10B981" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MacroCard label="Protéines" current={totalNutrition.protein_g} target={targetMacros.protein} color="#F59E0B" />
          <MacroCard label="Glucides" current={totalNutrition.carb_g} target={targetMacros.carbs} color="#8B5CF6" />
          <MacroCard label="Lipides" current={totalNutrition.fat_g} target={targetMacros.fat} color="#EF4444" />
        </div>
        <Button onClick={onAddFood} icon={<Plus size={20} />} className="w-full">Ajouter un aliment</Button>
      </Card>

      {/* Entraînement */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell size={24} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Entraînement</h2>
        </div>
        {completedWorkout ? (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-800">Séance terminée ✅</p>
            <p className="text-gray-600">{workouts.templates.find((t) => t.id === completedWorkout.template_id)?.name}</p>
          </div>
        ) : todayWorkout ? (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{workouts.templates.find((t) => t.id === todayWorkout.template_id)?.name}</h3>
            <p className="text-gray-600 flex items-center gap-1 mb-4"><Clock size={16} /> {formatTime(new Date(todayWorkout.date_time))}</p>
            <Button onClick={() => onStartWorkout(todayWorkout)} className="w-full">Démarrer la séance</Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">Aucune séance prévue aujourd'hui</p>
          </div>
        )}
      </Card>

      {/* Poids */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={24} className="text-orange-600" />
          <h2 className="text-lg font-semibold">Poids</h2>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{latestWeight.toFixed(1)} kg</p>
            {weight.length > 7 && (
              <p className="text-sm text-gray-600">{(latestWeight - weight[weight.length - 8].weight_kg >= 0 ? "+" : "")} {(latestWeight - weight[weight.length - 8].weight_kg).toFixed(1)} kg (7j)</p>
            )}
          </div>
          <Button variant="secondary" onClick={onAddWeight}>Peser</Button>
        </div>
        {weightData.length >= 2 && (
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Line type="monotone" dataKey="weight" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

const NutritionScreen = ({ nutrition, foods, user, savedMeals, onAddEntry, onSaveMeal }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaveMealModal, setShowSaveMealModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("petit_dej");
  const [quantity, setQuantity] = useState("100");
  const [activeTab, setActiveTab] = useState("foods");
  const [mealName, setMealName] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayEntries = nutrition.filter((e) => e.date === today);

  const mealTypes = [
    { key: "petit_dej", label: "Petit déjeuner" },
    { key: "dejeuner", label: "Déjeuner" },
    { key: "gouter", label: "Goûter" },
    { key: "diner", label: "Dîner" },
    { key: "collation", label: "Collation" }
  ];

  const filteredFoods = useMemo(() => foods.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase())), [foods, searchTerm]);
  const filteredSavedMeals = useMemo(() => savedMeals.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase())), [savedMeals, searchTerm]);

  const addFoodEntry = (food) => {
    const quantityNum = parseFloat(quantity) || 100;
    const mult = quantityNum / 100;
    const entry = {
      id: uid("n"),
      date: today,
      meal_type: selectedMeal,
      is_recipe: false,
      food_id: food.id,
      recipe_id: null,
      quantity_g: quantityNum,
      kcal: food.kcal_per_100g * mult,
      protein_g: food.protein_per_100g * mult,
      carb_g: food.carb_per_100g * mult,
      fat_g: food.fat_per_100g * mult
    };
    onAddEntry(entry);
    setShowAddModal(false);
    setSearchTerm("");
    setQuantity("100");
  };

  const addSavedMealEntries = (savedMeal) => {
    savedMeal.items.forEach((item) => {
      const food = foods.find((f) => f.id === item.food_id);
      if (!food) return;
      const mult = item.quantity_g / 100;
      const entry = {
        id: uid("n"),
        date: today,
        meal_type: selectedMeal,
        is_recipe: false,
        food_id: food.id,
        recipe_id: null,
        quantity_g: item.quantity_g,
        kcal: food.kcal_per_100g * mult,
        protein_g: food.protein_per_100g * mult,
        carb_g: food.carb_per_100g * mult,
        fat_g: food.fat_per_100g * mult
      };
      onAddEntry(entry);
    });
    setShowAddModal(false);
    setSearchTerm("");
  };

  const groupedEntries = mealTypes.map((meal) => ({
    ...meal,
    entries: todayEntries.filter((e) => e.meal_type === meal.key),
    totalKcal: todayEntries.filter((e) => e.meal_type === meal.key).reduce((s, e) => s + e.kcal, 0)
  }));

  const totals = todayEntries.reduce((a, e) => ({ kcal: a.kcal + e.kcal, protein_g: a.protein_g + e.protein_g, carb_g: a.carb_g + e.carb_g, fat_g: a.fat_g + e.fat_g }), { kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0 });
  const bmr = calculateBMR(user.sex, user.age, user.height_cm, user.current_weight_kg);
  const tdee = calculateTDEE(bmr, user.activity_level);
  const targetCalories = adjustCaloriesForGoal(tdee, user.goal);
  const targetMacros = calculateMacros(targetCalories, user.current_weight_kg, user.macro_overrides);

  const saveTodayMeal = () => {
    const mealEntries = todayEntries.filter((e) => e.meal_type === selectedMeal);
    if (mealEntries.length === 0) return alert("Aucun aliment dans ce repas à sauvegarder");
    const savedMeal = {
      id: uid("meal"),
      name: mealName || `${mealTypes.find((m) => m.key === selectedMeal)?.label} - ${formatDate(new Date())}`,
      meal_type: selectedMeal,
      items: mealEntries.map((e) => ({ food_id: e.food_id, quantity_g: e.quantity_g })),
      total_kcal: mealEntries.reduce((s, e) => s + e.kcal, 0),
      created_date: new Date().toISOString()
    };
    onSaveMeal(savedMeal);
    setShowSaveMealModal(false);
    setMealName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nutrition</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddModal(true)} icon={<Plus size={20} />}>Ajouter</Button>
          <Button variant="secondary" onClick={() => setShowSaveMealModal(true)}>Sauvegarder le repas</Button>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Aujourd'hui</h2>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(totals.kcal)} <span className="text-base font-normal text-gray-600">/ {targetCalories} kcal</span></p>
          </div>
          <ProgressCircle percentage={safePct(totals.kcal, targetCalories)} size={60} color="#10B981" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Protéines</p>
            <p className="font-bold text-orange-600">{Math.round(totals.protein_g)}g</p>
            <p className="text-xs text-gray-500">/{targetMacros.protein}g</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Glucides</p>
            <p className="font-bold text-purple-600">{Math.round(totals.carb_g)}g</p>
            <p className="text-xs text-gray-500">/{targetMacros.carbs}g</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Lipides</p>
            <p className="font-bold text-red-600">{Math.round(totals.fat_g)}g</p>
            <p className="text-xs text-gray-500">/{targetMacros.fat}g</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {groupedEntries.map((meal) => (
          <Card key={meal.key}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{meal.label}</h3>
              <span className="text-sm text-gray-600">{Math.round(meal.totalKcal)} kcal</span>
            </div>
            {meal.entries.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Aucun aliment ajouté</p>
            ) : (
              <div className="space-y-2">
                {meal.entries.map((e) => {
                  const food = foods.find((f) => f.id === e.food_id);
                  return (
                    <div key={e.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{food?.name}</p>
                        <p className="text-sm text-gray-600">{e.quantity_g}g</p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{Math.round(e.kcal)} kcal</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Food Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un aliment">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Repas</label>
          <div className="grid grid-cols-2 gap-2">
            {mealTypes.map((m) => (
              <button key={m.key} type="button" className={`p-2 text-sm rounded-lg border transition-all ${selectedMeal === m.key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`} onClick={() => setSelectedMeal(m.key)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantité (g)</label>
          <input type="number" className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" />
        </div>
        <div className="mb-4">
          <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
            <button className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === "foods" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`} onClick={() => setActiveTab("foods")}>
              Aliments
            </button>
            <button className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === "savedMeals" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`} onClick={() => setActiveTab("savedMeals")}>
              Repas sauvegardés
            </button>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{activeTab === "foods" ? "Rechercher un aliment" : "Rechercher un repas"}</label>
          <input type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={activeTab === "foods" ? "Nom de l'aliment..." : "Nom du repas..."} />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {activeTab === "foods"
            ? (filteredFoods.length > 0
                ? filteredFoods.map((food) => (
                    <div key={food.id} className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100" onClick={() => addFoodEntry(food)}>
                      <div>
                        <p className="font-medium text-gray-900">{food.name}</p>
                        <p className="text-sm text-gray-600">{food.kcal_per_100g} kcal/100g - P:{food.protein_per_100g}g G:{food.carb_per_100g}g L:{food.fat_per_100g}g</p>
                      </div>
                      <Plus size={20} className="text-blue-600" />
                    </div>
                  ))
                : <p className="text-center text-gray-500 py-8">Aucun aliment trouvé</p>)
            : (filteredSavedMeals.length > 0
                ? filteredSavedMeals.map((meal) => (
                    <div key={meal.id} className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100" onClick={() => addSavedMealEntries(meal)}>
                      <div>
                        <p className="font-medium text-gray-900">{meal.name}</p>
                        <p className="text-sm text-gray-600">{Math.round(meal.total_kcal)} kcal - {meal.items.length} aliments</p>
                      </div>
                      <Plus size={20} className="text-green-600" />
                    </div>
                  ))
                : <p className="text-center text-gray-500 py-8">Aucun repas sauvegardé trouvé</p>)}
        </div>
      </Modal>

      {/* Save Meal Modal */}
      <Modal isOpen={showSaveMealModal} onClose={() => setShowSaveMealModal(false)} title="Sauvegarder le repas">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Repas</label>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map((m) => (
                <button key={m.key} className={`p-2 text-sm rounded-lg border transition-all ${selectedMeal === m.key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`} onClick={() => setSelectedMeal(m.key)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du repas</label>
            <input type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="Ex: Petit-déj protéiné" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">{todayEntries.filter((e) => e.meal_type === selectedMeal).length} aliments - {Math.round(todayEntries.filter((e) => e.meal_type === selectedMeal).reduce((s, e) => s + e.kcal, 0))} kcal</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowSaveMealModal(false)} variant="secondary" className="flex-1">Annuler</Button>
            <Button onClick={saveTodayMeal} variant="success" className="flex-1" disabled={!mealName.trim()}>Sauvegarder</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const WorkoutScreen = ({ workouts, exercises, onCreateTemplate, onScheduleWorkout, onStartSession }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [tplName, setTplName] = useState("");
  const [tplItems, setTplItems] = useState([]); // {exercise_type_id, target_sets, target_reps, rest_sec}

  const [scheduleTemplateId, setScheduleTemplateId] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const upcoming = workouts.planned.filter((s) => s.date_time.split("T")[0] >= today && s.status === "planifiee").sort((a,b) => new Date(a.date_time) - new Date(b.date_time));

  const addTplItem = () => setTplItems((prev) => [...prev, { id: uid("it"), exercise_type_id: exercises[0]?.id || "ex1", target_sets: 4, target_reps: 10, rest_sec: 90 }]);
  const updateTplItem = (id, patch) => setTplItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeTplItem = (id) => setTplItems((prev) => prev.filter((it) => it.id !== id));

  const saveTemplate = () => {
    if (!tplName.trim() || tplItems.length === 0) return alert("Renseigne un nom et au moins un exercice.");
    const tpl = { id: uid("wt"), name: tplName.trim(), items: tplItems.map(({ id, ...rest }) => rest) };
    onCreateTemplate(tpl);
    setTplName("");
    setTplItems([]);
    setShowCreateModal(false);
  };

  const saveSchedule = () => {
    if (!scheduleTemplateId || !scheduleDateTime) return alert("Choisis un programme et une date/heure.");
    onScheduleWorkout({ id: uid("ws"), template_id: scheduleTemplateId, date_time: new Date(scheduleDateTime).toISOString(), status: "planifiee" });
    setScheduleTemplateId("");
    setScheduleDateTime("");
    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Entraînements</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)} icon={<Plus size={20} />}>Nouveau</Button>
          <Button variant="secondary" onClick={() => setShowScheduleModal(true)}>Planifier</Button>
        </div>
      </div>

      {upcoming.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Séances planifiées</h2>
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((s) => {
              const tpl = workouts.templates.find((t) => t.id === s.template_id);
              return (
                <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{tpl?.name}</p>
                    <p className="text-sm text-gray-600">{formatDate(new Date(s.date_time))} à {formatTime(new Date(s.date_time))}</p>
                  </div>
                  <Button variant="success" onClick={() => onStartSession(s)}>Démarrer</Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold mb-4">Mes programmes</h2>
        <div className="space-y-3">
          {workouts.templates.map((tpl) => (
            <div key={tpl.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{tpl.name}</p>
                <p className="text-sm text-gray-600">{tpl.items.length} exercices</p>
              </div>
              <Button variant="secondary" onClick={() => { setScheduleTemplateId(tpl.id); setShowScheduleModal(true); }}>Planifier</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Template Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouveau programme">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="Push, Pull, Legs..." />
          </div>

          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Exercices</h4>
            <Button variant="secondary" onClick={addTplItem}>Ajouter un exercice</Button>
          </div>

          {tplItems.length === 0 && <p className="text-sm text-gray-500">Aucun exercice. Ajoute‑en un.</p>}

          <div className="space-y-3">
            {tplItems.map((it) => (
              <div key={it.id} className="p-3 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-2">
                <select className="p-2 border rounded" value={it.exercise_type_id} onChange={(e) => updateTplItem(it.id, { exercise_type_id: e.target.value })}>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
                <input type="number" className="p-2 border rounded" value={it.target_sets} onChange={(e) => updateTplItem(it.id, { target_sets: parseInt(e.target.value || 0) })} placeholder="Séries" />
                <input type="number" className="p-2 border rounded" value={it.target_reps} onChange={(e) => updateTplItem(it.id, { target_reps: parseInt(e.target.value || 0) })} placeholder="Répétitions" />
                <input type="number" className="p-2 border rounded" value={it.rest_sec} onChange={(e) => updateTplItem(it.id, { rest_sec: parseInt(e.target.value || 0) })} placeholder="Repos (s)" />
                <Button variant="warning" onClick={() => removeTplItem(it.id)}>Supprimer</Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>Annuler</Button>
            <Button variant="success" className="flex-1" onClick={saveTemplate}>Enregistrer</Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Planifier une séance">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Programme</label>
            <select className="w-full p-3 border rounded-lg" value={scheduleTemplateId} onChange={(e) => setScheduleTemplateId(e.target.value)}>
              <option value="">Choisir…</option>
              {workouts.templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date & heure</label>
            <input type="datetime-local" className="w-full p-3 border rounded-lg" value={scheduleDateTime} onChange={(e) => setScheduleDateTime(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowScheduleModal(false)}>Annuler</Button>
            <Button variant="success" className="flex-1" onClick={saveSchedule}>Planifier</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const HistoryScreen = ({ nutrition, weight, workouts }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewType, setViewType] = useState("nutrition");

  const dayEntries = nutrition.filter((e) => e.date === selectedDate);
  const totalNutrition = dayEntries.reduce((acc, e) => ({ kcal: acc.kcal + e.kcal, protein_g: acc.protein_g + e.protein_g, carb_g: acc.carb_g + e.carb_g, fat_g: acc.fat_g + e.fat_g }), { kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded-lg text-sm ${viewType === "nutrition" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setViewType("nutrition")}>Nutrition</button>
          <button className={`px-3 py-1 rounded-lg text-sm ${viewType === "weight" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setViewType("weight")}>Poids</button>
        </div>
      </div>

      <Card>
        <input type="date" className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </Card>

      {viewType === "nutrition" && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Nutrition - {formatDate(new Date(selectedDate))}</h2>
          {dayEntries.length === 0 ? (
            <p className="text-gray-500">Aucune donnée nutritionnelle pour cette date</p>
          ) : (
            <div>
              <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="font-bold text-lg">{Math.round(totalNutrition.kcal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Protéines</p>
                  <p className="font-bold text-lg text-orange-600">{Math.round(totalNutrition.protein_g)}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Glucides</p>
                  <p className="font-bold text-lg text-purple-600">{Math.round(totalNutrition.carb_g)}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lipides</p>
                  <p className="font-bold text-lg text-red-600">{Math.round(totalNutrition.fat_g)}g</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Détail des entrées</h3>
                {dayEntries.map((e) => (
                  <div key={e.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{e.meal_type}</span>
                    <span className="font-medium">{Math.round(e.kcal)} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {viewType === "weight" && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Évolution du poids</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weight.slice(-30).map((w) => ({ date: w.date_time.split("T")[0], weight: w.weight_kg }))}>
                <XAxis dataKey="date" />
                <YAxis />
                <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

const SettingsScreen = ({ user, onUpdateUser, onExportData, onHardReset }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(user);

  const goalLabels = { seche: "Sèche", seche_intensive: "Sèche intensive", maintenance: "Maintenance", prise: "Prise de masse", prise_intensive: "Prise intensive" };
  const activityLabels = { sedentaire: "Sédentaire", leger: "Léger", modere: "Modéré", eleve: "Élevé", tres_eleve: "Très élevé" };

  const handleSave = () => { onUpdateUser(formData); setEditMode(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <Button onClick={editMode ? handleSave : () => setEditMode(true)} variant={editMode ? "success" : "secondary"}>{editMode ? "Sauvegarder" : "Modifier"}</Button>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Profil</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
              {editMode ? (
                <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={formData.age} onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value || 0) })} />
              ) : (
                <p className="text-gray-900">{user.age} ans</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
              {editMode ? (
                <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={formData.height_cm} onChange={(e) => setFormData({ ...formData, height_cm: parseFloat(e.target.value || 0) })} />
              ) : (
                <p className="text-gray-900">{user.height_cm} cm</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objectif</label>
            {editMode ? (
              <select className="w-full p-2 border border-gray-200 rounded-lg" value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })}>
                {Object.entries(goalLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            ) : (
              <p className="text-gray-900">{goalLabels[user.goal]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'activité</label>
            {editMode ? (
              <select className="w-full p-2 border border-gray-200 rounded-lg" value={formData.activity_level} onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}>
                {Object.entries(activityLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            ) : (
              <p className="text-gray-900">{activityLabels[user.activity_level]}</p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Données</h2>
        <div className="space-y-3">
          <Button onClick={onExportData} variant="secondary" className="w-full">Exporter mes données (JSON)</Button>
          <Button onClick={onHardReset} variant="warning" className="w-full">Réinitialiser l'application</Button>
        </div>
      </Card>
    </div>
  );
};

const ActiveWorkoutModal = ({ isOpen, onClose, session, template, onComplete }) => {
  const [notes, setNotes] = useState("");
  // MVP: simple checklist of exercises/sets
  const [doneMap, setDoneMap] = useState(() => {
    if (!template) return {};
    const map = {};
    template.items.forEach((it, idx) => { map[idx] = 0; });
    return map;
  });

  useEffect(() => {
    if (!template) return;
    const map = {};
    template.items.forEach((it, idx) => { map[idx] = 0; });
    setDoneMap(map);
  }, [template?.id]);

  if (!isOpen || !session || !template) return null;

  const totalSets = template.items.reduce((s, it) => s + (it.target_sets || 0), 0);
  const doneSets = Object.values(doneMap).reduce((s, v) => s + v, 0);
  const pct = safePct(doneSets, totalSets);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Séance: ${template.name}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">{formatDate(new Date(session.date_time))} • {formatTime(new Date(session.date_time))}</p>
          <ProgressCircle percentage={pct} size={60} color="#3B82F6" />
        </div>
        <div className="space-y-3">
          {template.items.map((it, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{it.exercise_type_id}</p>
                  <p className="text-sm text-gray-600">{it.target_sets}×{it.target_reps} • Repos {it.rest_sec}s</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => setDoneMap((m) => ({ ...m, [idx]: Math.max(0, (m[idx] || 0) - 1) }))}>-</button>
                  <span className="w-10 text-center font-medium">{doneMap[idx] || 0}/{it.target_sets}</span>
                  <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => setDoneMap((m) => ({ ...m, [idx]: Math.min(it.target_sets, (m[idx] || 0) + 1) }))}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea className="w-full p-3 border rounded-lg" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="RPE, charges, sensations..." />
        </div>
        <Button variant="success" className="w-full" onClick={() => onComplete({ notes, doneSets, totalSets })}>Terminer la séance</Button>
      </div>
    </Modal>
  );
};

// ================================
// App
// ================================

export default function FitnessApp() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [user, setUser] = useState(null);
  const [nutrition, setNutrition] = useState([]);
  const [foods] = useState(SEED_FOODS);
  const [weight, setWeight] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [workouts, setWorkouts] = useState({ templates: SEED_WORKOUT_TEMPLATES, planned: [], completed: [] });
  const [exercises] = useState(SEED_EXERCISES);

  // Global active session
  const [activeSession, setActiveSession] = useState(null);

  // Load from LS
  useEffect(() => {
    const u = localStorage.getItem("fitness_user");
    const n = localStorage.getItem("fitness_nutrition");
    const w = localStorage.getItem("fitness_weight");
    const ws = localStorage.getItem("fitness_workouts");
    const sm = localStorage.getItem("fitness_saved_meals");
    if (u) { setUser(JSON.parse(u)); setIsOnboarded(true); }
    if (n) setNutrition(JSON.parse(n));
    if (w) setWeight(JSON.parse(w));
    if (ws) setWorkouts(JSON.parse(ws));
    if (sm) setSavedMeals(JSON.parse(sm));
  }, []);

  // Persist
  useEffect(() => { if (user) localStorage.setItem("fitness_user", JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem("fitness_nutrition", JSON.stringify(nutrition)); }, [nutrition]);
  useEffect(() => { localStorage.setItem("fitness_weight", JSON.stringify(weight)); }, [weight]);
  useEffect(() => { localStorage.setItem("fitness_workouts", JSON.stringify(workouts)); }, [workouts]);
  useEffect(() => { localStorage.setItem("fitness_saved_meals", JSON.stringify(savedMeals)); }, [savedMeals]);

  const handleOnboardingComplete = (userData) => { setUser(userData); setIsOnboarded(true); };
  const handleAddNutritionEntry = (entry) => setNutrition((p) => [...p, entry]);
  const handleSaveMeal = (meal) => setSavedMeals((p) => [...p, meal]);
  const handleAddWeight = () => {
    const v = prompt("Entrez votre poids en kg:");
    const num = parseFloat(v);
    if (!isNaN(num)) setWeight((p) => [...p, { id: uid("w"), date_time: new Date().toISOString(), weight_kg: num, note: null }]);
  };
  const handleUpdateUser = (updated) => setUser(updated);
  const handleExportData = () => {
    const data = { user, nutrition, weight, workouts, savedMeals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fitness-data-${new Date().toISOString().split("T")[0]}.json`; a.click();
  };
  const handleHardReset = () => { if (confirm("Êtes-vous sûr de vouloir supprimer toutes vos données ?")) { localStorage.clear(); window.location.reload(); } };

  // Workout actions
  const createTemplate = (tpl) => setWorkouts((ws) => ({ ...ws, templates: [...ws.templates, tpl] }));
  const scheduleWorkout = (session) => setWorkouts((ws) => ({ ...ws, planned: [...ws.planned, session] }));
  const startSession = (session) => setActiveSession(session);
  const completeSession = ({ notes, doneSets, totalSets }) => {
    setWorkouts((ws) => {
      const planned = ws.planned.map((s) => (s.id === activeSession.id ? { ...s, status: "faite", notes, doneSets, totalSets, completed_at: new Date().toISOString() } : s));
      return { ...ws, planned, completed: [...ws.completed, planned.find((s) => s.id === activeSession.id)] };
    });
    setActiveSession(null);
    alert("Séance enregistrée ✅");
  };

  const navItems = [
    { key: "dashboard", label: "Accueil", icon: Home },
    { key: "nutrition", label: "Nutrition", icon: Apple },
    { key: "workouts", label: "Entraînement", icon: Dumbbell },
    { key: "history", label: "Historique", icon: BarChart3 },
    { key: "settings", label: "Paramètres", icon: Settings }
  ];

  if (!isOnboarded) return <OnboardingScreen onComplete={handleOnboardingComplete} />;

  const activeTemplate = activeSession ? workouts.templates.find((t) => t.id === activeSession.template_id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 pb-20">
          {currentScreen === "dashboard" && (
            <DashboardScreen user={user} nutrition={nutrition} workouts={workouts} weight={weight} onAddFood={() => setCurrentScreen("nutrition")} onAddWeight={handleAddWeight} onStartWorkout={startSession} />
          )}
          {currentScreen === "nutrition" && (
            <NutritionScreen nutrition={nutrition} foods={foods} user={user} savedMeals={savedMeals} onAddEntry={handleAddNutritionEntry} onSaveMeal={handleSaveMeal} />
          )}
          {currentScreen === "workouts" && (
            <WorkoutScreen workouts={workouts} exercises={exercises} onCreateTemplate={createTemplate} onScheduleWorkout={scheduleWorkout} onStartSession={startSession} />
          )}
          {currentScreen === "history" && (
            <HistoryScreen nutrition={nutrition} weight={weight} workouts={workouts} />
          )}
          {currentScreen === "settings" && (
            <SettingsScreen user={user} onUpdateUser={handleUpdateUser} onExportData={handleExportData} onHardReset={handleHardReset} />
          )}
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.key} className={`flex flex-col items-center py-2 px-3 ${currentScreen === item.key ? "text-blue-600" : "text-gray-600"}`} onClick={() => setCurrentScreen(item.key)}>
                  <Icon size={24} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global workout modal */}
      <ActiveWorkoutModal isOpen={!!activeSession} onClose={() => setActiveSession(null)} session={activeSession} template={activeTemplate} onComplete={completeSession} />
    </div>
  );
}
