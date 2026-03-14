import React, { createContext, useContext, useState } from 'react'

export const DoctorContext = createContext();

export const useDoctor=() => useContext(DoctorContext);

const DoctorContextProvider = ({children}) => {
  const [doctor, setDoctor] = useState(null);
  
  return (
    <DoctorContext.Provider value={{ doctor, setDoctor }}>
      {children}
    </DoctorContext.Provider>
  )
}

export default DoctorContextProvider
