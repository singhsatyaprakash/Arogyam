import React, { createContext, useContext, useState } from 'react'

export const DoctorContext = createContext();

// export const useDoctor = () => {
//   const context = useContext(DoctorContext);
//   if (!context) {
//     throw new Error('useDoctor must be used within DoctorContextProvider');
//   }
//   return context;
// };

const DoctorContextProvider = ({children}) => {
  const [doctor, setDoctor] = useState(null);
  
  return (
    <DoctorContext.Provider value={{ doctor, setDoctor }}>
      {children}
    </DoctorContext.Provider>
  )
}

export default DoctorContextProvider
