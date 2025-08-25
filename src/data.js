export const SEED_EXERCISES = [
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

export const SEED_FOODS = [
  { id: "f1", name: "Riz blanc", kcal_per_100g: 130, protein_per_100g: 2.7, carb_per_100g: 28, fat_per_100g: 0.3, is_custom: false },
  { id: "f2", name: "Poulet cuit", kcal_per_100g: 165, protein_per_100g: 31, carb_per_100g: 0, fat_per_100g: 3.6, is_custom: false },
  { id: "f3", name: "Amandes", kcal_per_100g: 579, protein_per_100g: 21, carb_per_100g: 22, fat_per_100g: 50, is_custom: false },
  { id: "f4", name: "Œuf", kcal_per_100g: 155, protein_per_100g: 13, carb_per_100g: 1.1, fat_per_100g: 11, is_custom: false },
  { id: "f5", name: "Banane", kcal_per_100g: 89, protein_per_100g: 1.1, carb_per_100g: 23, fat_per_100g: 0.3, is_custom: false },
  { id: "f6", name: "Avoine", kcal_per_100g: 389, protein_per_100g: 16.9, carb_per_100g: 66, fat_per_100g: 6.9, is_custom: false }
];

export const SEED_WORKOUT_TEMPLATES = [
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
