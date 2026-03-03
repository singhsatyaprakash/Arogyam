import React, { createContext, useState } from 'react'

export const PatientContext = createContext();

const PatientContextProvider = ({children}) => {
  const [patient, setPatient] = useState(null);
  
  return (
    <PatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </PatientContext.Provider>
  )
}

export default PatientContextProvider
