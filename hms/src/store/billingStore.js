// src/store/billingStore.js
import { create } from 'zustand';

const useBillingStore = create((set) => ({
  todaysPayments: [],
  monthlyPayments: [],
  yearlyPayments: [],
  totalPatients: 0,

  setTodaysPayments: (data) => set({ todaysPayments: data }),
  setMonthlyPayments: (data) => set({ monthlyPayments: data }),
  setYearlyPayments: (data) => set({ yearlyPayments: data }),
  setTotalPatients: (count) => set({ totalPatients: count }),
}));

export default useBillingStore;
