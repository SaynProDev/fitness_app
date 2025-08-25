import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import Card from "../components/Card";
import { formatDate } from "../utils";

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


export default HistoryScreen;
