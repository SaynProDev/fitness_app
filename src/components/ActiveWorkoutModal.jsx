import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import ProgressCircle from "./ProgressCircle";
import { safePct, formatDate, formatTime } from "../utils";

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

export default ActiveWorkoutModal;
