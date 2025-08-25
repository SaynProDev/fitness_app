import React from "react";
import { Apple, Plus, Dumbbell, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressCircle from "../components/ProgressCircle";
import { safePct, formatDate, formatTime, calculateBMR, calculateTDEE, adjustCaloriesForGoal, calculateMacros } from "../utils";

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
          <MacroCard label="Protéines" current={totalNutrition.protein_g} target={targetMacros.protein} color="#F59E0B"/>
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

const MacroCard = ({ label, current, target, color }) => (
  <div className="text-center">
    <p className="text-xs text-gray-600">{label}</p>
    <p className="font-bold" style={{ color }}>{Math.round(current)} / {Math.round(target)}g</p>
  </div>
);

export default DashboardScreen;
