import React, { useState } from "react";
import { Plus } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { uid, formatDate, formatTime } from "../utils";

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


export default WorkoutScreen;
