import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressCircle from "../components/ProgressCircle";
import Modal from "../components/Modal";
import { uid, safePct, formatDate, calculateBMR, calculateTDEE, adjustCaloriesForGoal, calculateMacros } from "../utils";

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


export default NutritionScreen;
