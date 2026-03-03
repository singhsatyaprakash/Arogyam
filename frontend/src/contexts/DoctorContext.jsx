import React, { createContext, useState } from 'react'

export const DoctorContext = createContext();

const DoctorContextProvider = ({children}) => {
  const [doctor, setDoctor] = useState(null);
  
  return (
    <DoctorContext.Provider value={{ doctor, setDoctor }}>
      {children}
    </DoctorContext.Provider>
  )
}

export default DoctorContextProvider
