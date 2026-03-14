import React from 'react'
import { useNavigate } from 'react-router-dom'

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const fee = doctor?.consultationFee?.video ?? doctor?.consultationFee?.chat ?? 0;

  const onBook = () => {
    // navigate to booking page for this doctor
    navigate(`/patient/doctor/${doctor._id}/book`, { state: { doctor } });
  }

  return (
    <div className="doctor-card" style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ margin: 0 }}>{doctor.name}</h4>
          <div style={{ fontSize: 13, color: '#666' }}>{doctor.specialization}</div>
          <div style={{ fontSize: 13, color: '#666' }}>{doctor.experience} yrs</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold' }}>₹{fee}</div>
          <div style={{ fontSize: 13 }}>{doctor.rating || '—'} ★</div>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={onBook} style={{ padding: '8px 12px' }}>Book Now</button>
      </div>
    </div>
  )
}

export default DoctorCard