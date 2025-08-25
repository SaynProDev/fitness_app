import React, { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";

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
            {step === steps.length - 1 ? "Terminer" : "Suivant"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingScreen;
