import { create } from 'zustand'
import api from '../services/api'

const usePatientStore = create((set, get) => ({
  patients: [],
  totals: {
    totalConsultation: 0,
    totalLab: 0,
    totalPharmacy: 0,
    grandTotal: 0,
  },

  fetchPatients: async () => {
    try {
      const res = await api.get('/api/patients-main/')
      const data = res.data

      // Process & calculate totals
      let totalConsultation = 0
      let totalLab = 0
      let totalPharmacy = 0

      const patientsWithTotal = data.map(patient => {
        const consultation = parseFloat(patient.amount || 0)
        const lab = parseFloat(patient.lab_tests?.[0]?.price || 0)
        const pharmacy = parseFloat(patient.pharmacy_records?.[0]?.total_amount || 0)

        totalConsultation += consultation
        totalLab += lab
        totalPharmacy += pharmacy

        return {
          ...patient,
          calculatedTotal: consultation + lab + pharmacy,
        }
      })

      set({
        patients: patientsWithTotal,
        totals: {
          totalConsultation,
          totalLab,
          totalPharmacy,
          grandTotal: totalConsultation + totalLab + totalPharmacy,
        },
      })
    } catch (error) {
      console.error('Failed to fetch patient data', error)
    }
  },
}))
export default usePatientStore
