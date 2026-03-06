import React, { createContext, useContext, useState } from 'react'

export const PatientContext = createContext();

// export const usePatient = () => {
//   const context = useContext(PatientContext);
//   if (!context) {
//     throw new Error('usePatient must be used within PatientContextProvider');
//   }
//   return context;
// };

// export const usePatientAuth = () => {
//   const { patient } = usePatient();
//   return { patient, loading: false };
// };

const PatientContextProvider = ({children}) => {
  const [patient, setPatient] = useState(null);
  
  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  )
}

export default PatientContextProvider
