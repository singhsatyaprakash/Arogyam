import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PatientNavbar from '../../patientComponent/PatientNavbar'
import { PatientContext } from '../../contexts/PatientContext'
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
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const navigate = useNavigate();
  const { patient } = useContext(PatientContext);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('name', debouncedSearch);
    if (specialization) params.append('specialization', specialization);
    if (minFee) params.append('minFee', minFee);
    if (maxFee) params.append('maxFee', maxFee);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/appointments/search`, { params: Object.fromEntries(params) });
      if (res.data?.success) setDoctors(res.data.data || []);
      else setDoctors([]);
    } catch (e) {
      console.error(e);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, specialization, minFee, maxFee]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchName.trim()), 300);
    return () => clearTimeout(t);
  }, [searchName]);

  useEffect(() => {
    // fetch whenever any filter changes
    fetchDoctors();
  }, [fetchDoctors]);

  const openBooking = (doc) => {
    // navigate to booking process page with doctor id (and pass doctor in state optional)
    navigate(`/patient/doctor/${doc._id}/book`, { state: { doctor: doc } });
  };

  const activeFilters = useMemo(() => {
    const items = [];
    if (debouncedSearch) items.push(`Name: ${debouncedSearch}`);
    if (specialization) items.push(`Specialization: ${specialization}`);
    if (minFee) items.push(`Min ₹${minFee}`);
    if (maxFee) items.push(`Max ₹${maxFee}`);
    return items;
  }, [debouncedSearch, specialization, minFee, maxFee]);

  const resetFilters = () => {
    setSpecialization('');
    setMinFee('');
    setMaxFee('');
    setSearchName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-cyan-50">
      <PatientNavbar />
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="w-full max-w-7xl px-6 py-8 lg:mx-0">
          <div className="rounded-2xl border border-emerald-100 bg-white/90 backdrop-blur p-6 md:p-7 shadow-sm mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Book Appointment</h2>
                <p className="text-sm text-gray-600 mt-1">Find and book appointments with verified doctors</p>
              </div>
              <div className="text-sm text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full w-fit">
                Hello, {patient?.name || 'Patient'}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs rounded-full bg-white border border-gray-200 px-3 py-1 text-gray-700">Fast bookings</span>
              <span className="text-xs rounded-full bg-white border border-gray-200 px-3 py-1 text-gray-700">Verified doctors</span>
              <span className="text-xs rounded-full bg-white border border-gray-200 px-3 py-1 text-gray-700">Multiple consultation modes</span>
            </div>
          </div>

          {/* Filter Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Search Filters</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">Showing {doctors.length} doctors</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="text-xs text-gray-500">Search Doctor</label>
                <div className="mt-1 relative">
                  <input
                    placeholder="Search by name..."
                    value={searchName}
                    onChange={e=>setSearchName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                  <button type="button" onClick={fetchDoctors} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600">
                    <MdSearch />
                  </button>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-gray-500">Specialization</label>
                <select
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
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
                    className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
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
                    className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <button
                  onClick={fetchDoctors}
                  className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 whitespace-nowrap hover:bg-emerald-700"
                >
                  <MdSearch /> Search
                </button>
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 whitespace-nowrap"
                >
                  <MdRefresh /> Reset
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="form-checkbox" /> Online Only
              </label>
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((f) => (
                    <span key={f} className="text-xs bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full text-emerald-700">{f}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Doctors Grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 bg-gray-200 rounded" />
                        <div className="h-3 w-1/3 bg-gray-200 rounded" />
                        <div className="h-3 w-2/3 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="mt-4 h-10 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              doctors.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-600 shadow-sm">
                  <div className="text-gray-900 font-medium">No doctors found</div>
                  <div className="text-sm mt-1">Try adjusting filters or search keywords.</div>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {doctors.map(doc => (
                    <div key={doc._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 text-lg font-semibold shrink-0">
                          {doc.name?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-lg text-gray-900">{doc.name}</div>
                            {doc.isVerified && <MdVerified className="text-emerald-600" />}
                            <span className="ml-auto inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">Online</span>
                          </div>
                          <div className="text-sm text-gray-500">{doc.specialization}</div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1"><MdStar className="text-yellow-500" /> {doc.rating ?? 'N/A'}</div>
                            <div className="flex items-center gap-1"><MdAccessTime /> {doc.experience ?? `${doc.yearsExp ?? 0} yrs`}</div>
                            <div className="flex items-center gap-1"><MdLanguage /> {doc.languages?.join(', ') ?? 'English'}</div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(doc.qualifications||[]).slice(0,3).map(q=>(
                              <span key={q} className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded-full">{q}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-gray-100 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 min-w-0">
                          <div className="flex items-center gap-1 whitespace-nowrap"><MdChat className="text-emerald-600" /> ₹{doc.consultationFee?.chat ?? 0}</div>
                          <div className="flex items-center gap-1 whitespace-nowrap"><MdCall className="text-sky-600" /> ₹{doc.consultationFee?.voice ?? 0}</div>
                          <div className="flex items-center gap-1 whitespace-nowrap"><MdVideocam className="text-violet-600" /> ₹{doc.consultationFee?.video ?? 0}</div>
                        </div>

                        <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="text-sm text-gray-500 whitespace-nowrap">
                            From <span className="font-semibold text-gray-800">₹{Math.min(doc.consultationFee?.chat||9999, doc.consultationFee?.voice||9999, doc.consultationFee?.video||9999)}</span>
                          </div>
                          <button
                            onClick={()=>openBooking(doc)}
                            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg whitespace-nowrap shrink-0 w-full sm:w-auto hover:bg-emerald-700"
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