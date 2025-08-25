import React, { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";

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


export default SettingsScreen;
