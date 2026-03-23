import { create } from "zustand";

interface GoalsStore {
  monthlyGoal: number;
  annualGoal: number;
  setMonthlyGoal: (value: number) => void;
  setAnnualGoal: (value: number) => void;
}

export const useGoalsStore = create<GoalsStore>((set) => ({
  monthlyGoal: 25000,
  annualGoal: 300000,
  setMonthlyGoal: (value) => set({ monthlyGoal: value }),
  setAnnualGoal: (value) => set({ annualGoal: value }),
}));
