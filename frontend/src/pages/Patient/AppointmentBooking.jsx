import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PatientNavbar from '../../patientComponent/PatientNavbar'
import { usePatientAuth } from '../../contexts/PatientContext'
import { MdChat, MdCall, MdVideocam, MdStar, MdAccessTime, MdLanguage, MdVerified, MdSearch, MdRefresh } from 'react-icons/md'
import axios from 'axios'

//these we will fetch later on the from doctor database using api  all unique sspecializations of doctors...
const SPECIALIZATIONS = [
  'General Physician','Cardiologist','Dermatologist','Psychiatrist','Pediatrician',
  'Neurologist','Orthopedic','Gynecologist','Endocrinologist','ENT'
];

const AppointmentBooking = () => {
  const [specialization, setSpecialization] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');

  const navigate = useNavigate();
  const { patient } = usePatientAuth()
  // console.log('Logged in patient:', patient);
  const fetchDoctors = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchName) params.append('name', searchName);
    if (specialization) params.append('specialization', specialization);
    if (minFee) params.append('minFee', minFee);
    if (maxFee) params.append('maxFee', maxFee);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/appointments/search`, { params: Object.fromEntries(params) });
      console.log(res);
      if (res.data?.success) setDoctors(res.data.data || []);
      else setDoctors([]);
    } catch (e) {
      console.error(e);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch whenever any filter changes
    fetchDoctors();
  }, [specialization, minFee, maxFee, searchName]);


  const openBooking = (doc) => {
    // navigate to booking process page with doctor id (and pass doctor in state optional)
    navigate(`/patient/doctor/${doc._id}/book`, { state: { doctor: doc } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="w-full max-w-7xl px-6 py-8 lg:mx-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Book Appointment</h2>
              <p className="text-sm text-gray-500">Find and book appointments with verified doctors</p>
            </div>
          </div>

          {/* Filter Card */}
          <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
            {/* CHANGED: make filter grid 12-col responsive to prevent overflow */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="text-xs text-gray-500">Search Doctor</label>
                <div className="mt-1 relative">
                  <input
                    placeholder="Search by name..."
                    value={searchName}
                    onChange={e=>setSearchName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md pr-10"
                  />
                  <button type="button" onClick={fetchDoctors} className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600">
                    <MdSearch />
                  </button>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-gray-500">Specialization</label>
                <select
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                >
                  <option value=''>All Specializations</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="md:col-span-3 flex gap-2">
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-gray-500">Min Fee (₹)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={minFee}
                    onChange={e=>setMinFee(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-gray-500">Max Fee (₹)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Any"
                    value={maxFee}
                    onChange={e=>setMaxFee(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <button
                  onClick={fetchDoctors}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <MdSearch /> Search
                </button>
                <button
                  onClick={() => { setSpecialization(''); setMinFee(''); setMaxFee(''); setSearchName(''); fetchDoctors(); }}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-200 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 whitespace-nowrap"
                >
                  <MdRefresh /> Reset
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="form-checkbox" /> Online Only
              </label>
              <div className="text-sm text-gray-500">Showing {doctors.length} doctors</div>
            </div>
          </div>
          
          {/* Doctors Grid */}
          <div>
            {loading ? <div className="text-gray-600">Loading...</div> : (
              doctors.length === 0 ? <div className="text-gray-500">No doctors found</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {doctors.map(doc => (
                    <div key={doc._id} className="bg-white rounded-xl p-4 shadow-sm border flex flex-col">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-lg font-semibold">
                          {doc.name?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-lg">{doc.name}</div>
                            {doc.isVerified && <MdVerified className="text-green-600" />}
                            <span className="ml-auto inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Online</span>
                          </div>
                          <div className="text-sm text-gray-500">{doc.specialization}</div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1"><MdStar className="text-yellow-500" /> {doc.rating ?? 'N/A'}</div>
                            <div className="flex items-center gap-1"><MdAccessTime /> {doc.experience ?? `${doc.yearsExp ?? 0} yrs`}</div>
                            <div className="flex items-center gap-1"><MdLanguage /> {doc.languages?.join(', ') ?? 'English'}</div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(doc.qualifications||[]).slice(0,3).map(q=>(
                              <span key={q} className="text-xs bg-gray-100 px-2 py-1 rounded">{q}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* CHANGED: footer wraps so Book Now never overflows */}
                      <div className="mt-4 border-t pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 min-w-0">
                          <div className="flex items-center gap-1 whitespace-nowrap"><MdChat /> ₹{doc.consultationFee?.chat ?? 0}</div>
                          <div className="flex items-center gap-1 whitespace-nowrap"><MdCall /> ₹{doc.consultationFee?.voice ?? 0}</div>
                          <div className="flex items-center gap-1 whitespace-nowrap"><MdVideocam /> ₹{doc.consultationFee?.video ?? 0}</div>
                        </div>

                        <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="text-sm text-gray-500 whitespace-nowrap">
                            From <span className="font-semibold text-gray-800">₹{Math.min(doc.consultationFee?.chat||9999, doc.consultationFee?.voice||9999, doc.consultationFee?.video||9999)}</span>
                          </div>
                          <button
                            onClick={()=>openBooking(doc)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md whitespace-nowrap shrink-0 w-full sm:w-auto"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AppointmentBooking