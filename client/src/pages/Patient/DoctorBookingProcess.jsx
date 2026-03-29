import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdChat, MdCall, MdVideocam, MdStar, MdVerified, MdCircle } from "react-icons/md";
import {PatientContext} from "../../contexts/PatientContext";
import PatientNavbar from "../../patientComponent/PatientNavbar";
import noProfile from "../../assets/noProfile.webp";
import ChatBookingOnly from "../../patientComponent/ChatBookingOnly";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
const DoctorBookingProcess = () => {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { patient } = useContext(PatientContext);

  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [loading, setLoading] = useState(!doctor);

  const [mode, setMode] = useState("video");

  const consultationModes = [
    { key: "chat", label: "Chat", icon: MdChat },
    { key: "voice", label: "Voice", icon: MdCall },
    { key: "video", label: "Video", icon: MdVideocam },
    { key: "in-person", label: "In-person", icon: null },
  ];

  const getLocalYYYYMMDD = (date = new Date()) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayStr = getLocalYYYYMMDD();

  const prettyDate = (value) => {
    if (!value) return "";
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const nextDates = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const days = 7;
    const out = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push(getLocalYYYYMMDD(d));
    }
    return out;
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => getLocalYYYYMMDD());

  //availability states (ONLY for voice/video/in-person)
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availability, setAvailability] = useState({
    slots: [],
    bookedSlots: [],
    slotDurationMinutes: 15,
  });

  const [selectedSlot, setSelectedSlot] = useState(null);

  const normalizeTime = (t) => String(t ?? "").trim();

  const bookedTimes = useMemo(() => {
    const raw = availability?.bookedSlots ?? [];
    const times = raw
      .map((b) => (typeof b === "string" ? b : b?.time))
      .map(normalizeTime)
      .filter(Boolean);
    return new Set(times);
  }, [availability?.bookedSlots]);

  //compute all times for the day
  const allTimes = useMemo(() => {
    const duration =
      Number(availability?.slotDurationMinutes) ||
      Number(doctor?.slotDurationMinutes) ||
      15;

    const parseHHMM = (hhmm) => {
      const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(hhmm || "").trim());
      if (!m) return null;
      return { hh: Number(m[1]), mm: Number(m[2]) };
    };

    const minutesToHHMM = (mins) => {
      const hh = String(Math.floor(mins / 60)).padStart(2, "0");
      const mm = String(mins % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    };

    const hhmmToMinutes = (hhmm) => {
      const p = parseHHMM(hhmm);
      if (!p) return null;
      return p.hh * 60 + p.mm;
    };

    const from = doctor?.availability?.from;
    const to = doctor?.availability?.to;
    const pFrom = parseHHMM(from);
    const pTo = parseHHMM(to);

    // fallback: merge free + booked returned by API
    if (!pFrom || !pTo) {
      const free = (availability?.slots || [])
        .map((s) => normalizeTime(s?.time))
        .filter(Boolean);

      const booked = Array.from(bookedTimes);

      let merged = Array.from(new Set([...free, ...booked])).sort();

      if (selectedDate === todayStr) {
        const now = new Date();
        const nowM = now.getHours() * 60 + now.getMinutes();
        const cutoff =
          Math.ceil(nowM / Math.max(duration, 1)) * Math.max(duration, 1);

        merged = merged.filter((t) => {
          const tm = hhmmToMinutes(t);
          return tm == null ? true : tm >= cutoff;
        });
      }

      return merged;
    }

    const startM = pFrom.hh * 60 + pFrom.mm;
    const endM = pTo.hh * 60 + pTo.mm;
    if (!(endM > startM) || !(duration > 0)) return [];

    let times = [];
    for (let t = startM; t + duration <= endM; t += duration) {
      times.push(minutesToHHMM(t));
    }

    if (selectedDate === todayStr) {
      const now = new Date();
      const nowM = now.getHours() * 60 + now.getMinutes();
      const cutoff = Math.ceil(nowM / duration) * duration;

      times = times.filter((hhmm) => {
        const tm = hhmmToMinutes(hhmm);
        return tm == null ? true : tm >= cutoff;
      });
    }

    return times;
  }, [
    availability?.slotDurationMinutes,
    availability?.slots,
    bookedTimes,
    doctor?.availability?.from,
    doctor?.availability?.to,
    doctor?.slotDurationMinutes,
    selectedDate,
    todayStr,
  ]);

  const freeSlotByTime = useMemo(() => {
    const m = new Map();
    (availability?.slots || []).forEach((s) => {
      const t = normalizeTime(s?.time);
      if (t) m.set(t, s);
    });
    return m;
  }, [availability?.slots]);

  useEffect(() => {
    if (doctor) return;
    setLoading(true);
    let cancelled = false;

    const load = async () => {
      try {
        let res;
        try {
          res = await axios.get(
            `${import.meta.env.VITE_API_URL}/doctors/${doctorId}`
          );
        } catch {
          res = await axios.get(
            `${import.meta.env.VITE_API_URL}/doctors/search`,
            {
              params: { doctorId },
            }
          );
        }

        const data = res?.data;
        const doc = data?.success ? data.data : data;

        if (!cancelled) setDoctor(doc);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [doctor, doctorId]);

  useEffect(() => {
    const docId = doctor?._id || doctorId;
    if (!docId || !selectedDate || !mode) return;

    if (mode === "chat") return;

    let cancelled = false;

    setAvailabilityError("");
    setAvailabilityLoading(true);
    setSelectedSlot(null);

    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/appointments/availability`,
          {
            params: { doctorId: docId, date: selectedDate, type: mode },
          }
        );

        if (cancelled) return;

        const data = res?.data?.data || {};
        setAvailability({
          slots: Array.isArray(data?.slots) ? data.slots : [],
          bookedSlots: Array.isArray(data?.bookedSlots)
            ? data.bookedSlots
            : [],
          slotDurationMinutes: Number(data?.slotDurationMinutes) || 15,
        });
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setAvailability({
            slots: [],
            bookedSlots: [],
            slotDurationMinutes: 15,
          });
          setAvailabilityError(
            err?.response?.data?.message || "Failed to load availability"
          );
        }
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doctor?._id, doctorId, selectedDate, mode]);

  // ✅ Proceed for voice/video/in-person slot booking
  const handleProceed = () => {
    if (!selectedSlot) return;

    const time = normalizeTime(selectedSlot?.time);
    const fee = Number(selectedSlot?.fee ?? doctor?.consultationFee?.[mode] ?? 0);

    navigate("/patient/payment", {
      state: {
        bookingType: "SLOT",
        doctorId: doctor?._id || doctorId,
        doctor: { _id: doctor?._id || doctorId, name: doctor?.name },
        patientId: patient?.patient?._id,
        date: selectedDate,
        type: mode,
        time,
        fee,
      },
    });
  };

  if (loading) {
    return (
      <>
        <PatientNavbar />
        <main className="bg-gray-50 min-h-screen pt-16 lg:pt-0 lg:pl-64 flex items-center justify-center px-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-8 text-center w-full max-w-md">
            <p className="text-lg font-semibold text-gray-800">Loading doctor profile...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch details.</p>
          </div>
        </main>
      </>
    );
  }

  if (!doctor) {
    return (
      <>
        <PatientNavbar />
        <main className="bg-gray-50 min-h-screen pt-16 lg:pt-0 lg:pl-64 flex items-center justify-center px-6">
          <div className="bg-white border border-red-100 rounded-2xl shadow-sm px-6 py-8 text-center w-full max-w-md">
            <p className="text-lg font-semibold text-gray-800">Doctor not found</p>
            <p className="text-sm text-gray-500 mt-2">Try returning to search and selecting another profile.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PatientNavbar />

      <main className="bg-gradient-to-b from-emerald-50/70 via-white to-cyan-50/60 min-h-screen pt-16 lg:pt-0 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Doctor Header */}
          <div className="bg-white/90 backdrop-blur rounded-3xl border border-emerald-100 shadow-sm p-6 flex flex-col md:flex-row gap-6">
            <img
              src={doctor.profileImage || noProfile}
              alt={doctor.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-emerald-200"
            />

            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">{doctor.name}</h2>

              <p className="text-sm text-gray-600 mt-1">
                {doctor.specialization} • {doctor.experience} yrs experience
              </p>

              <div className="flex items-center gap-3 mt-3 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doctor.isVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {doctor.isVerified ? (
                    <span className="inline-flex items-center gap-1"><MdVerified /> Verified</span>
                  ) : "Not Verified"}
                </span>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doctor.isOnline
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <MdCircle className="text-[10px]" />
                    {doctor.isOnline ? "Online" : "Offline"}
                  </span>
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <MdStar className="text-yellow-500" />
                <span>
                  {doctor.rating ?? 0} Rating • {doctor.totalReviews ?? 0} Reviews
                </span>
              </div>
            </div>
          </div>

          {/* About + Fee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-2">About Doctor</h3>
              <p className="text-sm text-gray-600">
                {doctor.bio || "No bio provided."}
              </p>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-1">Qualifications</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {(doctor.qualifications || []).length === 0 ? (
                    <li>Not specified</li>
                  ) : (
                    doctor.qualifications.map((q, i) => <li key={i}>{q}</li>)
                  )}
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-1">Languages</h4>
                <p className="text-sm text-gray-600">
                  {(doctor.languages || []).join(", ") || "Not specified"}
                </p>
              </div>
            </div>

            {/* Fees */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Consultation Fees</h3>

              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                  <MdChat className="text-emerald-600 text-2xl" />
                  <span>Chat: ₹{doctor.consultationFee?.chat ?? 0}</span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2.5">
                  <MdCall className="text-sky-600 text-2xl" />
                  <span>Voice: ₹{doctor.consultationFee?.voice ?? 0}</span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5">
                  <MdVideocam className="text-violet-600 text-2xl" />
                  <span>Video: ₹{doctor.consultationFee?.video ?? 0}</span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                  <LocalHospitalIcon className="text-amber-600 text-2xl" />
                  <span>In-person: ₹{doctor.consultationFee?.["in-person"] ?? 0}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-1">Availability</h4>
                <p className="text-sm text-gray-600">
                  {doctor.availability?.from || "N/A"} –{" "}
                  {doctor.availability?.to || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">
              Choose Consultation Mode
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {consultationModes.map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  className={[
                    "flex items-center justify-center gap-2 cursor-pointer border rounded-2xl px-3 py-3 transition text-center",
                    mode === key
                      ? "bg-emerald-50 text-emerald-700 border-emerald-400 ring-2 ring-emerald-100"
                      : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    checked={mode === key}
                    onChange={() => setMode(key)}
                    className="sr-only"
                  />
                  {Icon ? <Icon className="text-base" /> : <span><LocalHospitalIcon className="text-gray-500 text-2xl" /></span>}
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {/* ✅ If CHAT -> render ChatBookingOnly, else slots UI */}
            {mode === "chat" ? (
              <ChatBookingOnly
                doctor={doctor}
                patient={patient.patient}
                onProceed={(note) => {
                  const fee = Number(doctor?.consultationFee?.chat ?? 0);

                  navigate("/patient/chat-payment", {
                    state: {
                      bookingType: "CHAT",
                      doctorId: doctor?._id || doctorId,
                      doctor: { _id: doctor?._id || doctorId, name: doctor?.name },
                      patientId: patient?.patient?._id,
                      fee,
                      note,
                      chatDurationDays: 10,
                    },
                  });
                }}
              />
            ) : (
              <>
                {/* Date Selection */}
                <div className="mt-5 bg-gradient-to-r from-emerald-50/70 to-cyan-50/60 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {nextDates.map((d) => {
                      const active = d === selectedDate;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={[
                            "whitespace-nowrap border rounded-full px-3 py-1.5 text-xs transition font-medium",
                            active
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400",
                          ].join(" ")}
                        >
                          {d === todayStr ? `Today (${prettyDate(d)})` : prettyDate(d)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <label className="text-sm text-gray-700 font-medium">
                      Select date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={todayStr}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>
                </div>

                {/* Slots UI */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Available slots</h4>
                    <span className="text-xs text-gray-500">
                      {mode} • {selectedDate}
                    </span>
                  </div>

                  {availabilityLoading && (
                    <p className="mt-2 text-sm text-gray-500">Loading slots...</p>
                  )}

                  {!availabilityLoading && availabilityError && (
                    <p className="mt-2 text-sm text-red-600">{availabilityError}</p>
                  )}

                  {!availabilityLoading &&
                    !availabilityError &&
                    (allTimes?.length ?? 0) === 0 && (
                      <p className="mt-2 text-sm text-gray-500">
                        No slots available for the selected date/mode.
                      </p>
                    )}

                  {!availabilityLoading &&
                    !availabilityError &&
                    (allTimes?.length ?? 0) > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                        {allTimes.map((time) => {
                          const isBooked = bookedTimes.has(time);
                          const freeSlot = freeSlotByTime.get(time);

                          const slot = freeSlot || {
                            time,
                            fee: doctor?.consultationFee?.[mode] ?? 0,
                            type: mode,
                          };

                          const isSelected =
                            normalizeTime(selectedSlot?.time) === time;

                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={isBooked}
                              onClick={() => {
                                if (!isBooked) setSelectedSlot(slot);
                              }}
                              className={[
                                "border rounded-xl px-3 py-2.5 text-left transition shadow-sm",
                                isBooked
                                  ? "bg-rose-50 text-rose-800 cursor-not-allowed border-rose-200"
                                  : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-500",
                                !isBooked && isSelected
                                  ? "border-emerald-600 ring-2 ring-emerald-200"
                                  : "",
                              ].join(" ")}
                              title={isBooked ? "Already booked" : "Select slot"}
                            >
                              <div className="text-sm font-medium">{time}</div>
                              <div
                                className={[
                                  "text-xs",
                                  isBooked ? "text-rose-600" : "text-emerald-700",
                                ].join(" ")}
                              >
                                ₹
                                {Number(
                                  slot?.fee ?? doctor?.consultationFee?.[mode] ?? 0
                                )}
                              </div>
                              {isBooked && (
                                <div className="text-xs text-rose-600 mt-1">
                                  Already booked
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {selectedSlot && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-emerald-200 rounded-xl p-3.5 bg-emerald-50">
                      <div className="text-sm text-gray-700">
                        Selected:{" "}
                        <span className="font-medium">{selectedDate}</span> at{" "}
                        <span className="font-medium">
                          {normalizeTime(selectedSlot?.time)}
                        </span>{" "}
                        <span className="text-gray-500">({mode})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleProceed}
                        className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                      >
                        Proceed
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </>
  );
};

export default DoctorBookingProcess;