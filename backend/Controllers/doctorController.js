const Doctor = require('../Models/doctor.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { doctorRescheduleAppointment } = require('./appointmentContoller');
const ChatConnection = require('../Models/chatConnection.model');

const SUPPORTED_CONSULTATION_TYPES = new Set(['chat', 'video', 'voice', 'in-person']);

const parseDateOnly = (value) => {
  if (!value || typeof value !== 'string') return null;
  // Expect YYYY-MM-DD
  const m = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!m) return null;
  const [y, mo, d] = value.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseTimeHHMM = (value) => {
  if (!value || typeof value !== 'string') return null;
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return { hh, mm, normalized: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` };
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Register a new doctor...
const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      specialization,
      experience,
      qualifications,
      languages,
      chatFee,
      voiceFee,
      videoFee,
      fromTime,
      toTime
    } = req.body;

    if (!name || !email || !phone || !password || !specialization || experience == null || chatFee == null || voiceFee == null || videoFee == null || !fromTime || !toTime) {
      return res.status(400).json({success: false, message: 'Please fill all required fields'});
    }
    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({success: false,message: 'Doctor with this email already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = new Doctor({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      specialization,
      experience: parseInt(experience),
      qualifications: qualifications ? (Array.isArray(qualifications) ? qualifications : qualifications.split(',').map(q => q.trim())) : [],
      languages: languages ? (Array.isArray(languages) ? languages : languages.split(',').map(lang => lang.trim())) : [],
      consultationFee: {
        chat: parseInt(chatFee),
        voice: parseInt(voiceFee),
        video: parseInt(videoFee)
      },
      availability: {
        from: fromTime,
        to: toTime
      }
    });

    await doctor.save();

    const token = jwt.sign({Id: doctor._id, email: doctor.email, role: 'doctor' }, process.env.JWT_SECRET || 'your_jwt_secret_key_here' ,{ expiresIn: '7d' });
    delete doctor.password;
    res.status(201).json({success: true,message: 'Doctor registered successfully',data:{doctor,token}});

  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({success: false,message: 'Internal server error'});
  }
};

// Doctor login...
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({success: false, message: 'Please provide email and password'});
    }

    const doctor = await Doctor.findByEmail(email);
    if (!doctor) {
      return res.status(401).json({success: false,message: 'Invalid credentials'});
    }
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({success: false, message: 'Invalid credentials'});
    }

    // Check if doctor is verified ///later on this code will implemented
    // if (!doctor.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Account not verified. Please contact administration.'
    //   });
    // }

    const token = jwt.sign({id: doctor._id, email: doctor.email, role: 'doctor'},process.env.JWT_SECRET || 'your_jwt_secret_key_here',{ expiresIn: '7d' });

    doctor.lastLogin = Date.now();
    await doctor.save();
    delete doctor.password;

    res.status(200).json({success: true,message: 'Login successful',data: {doctor,token}});

  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({success: false,message: 'Internal server error'});
  }
};

const getConnectionsList=async(req,res)=>{
  try{
    console.log(req.body);
    const doctorId=req.body.doctorId;
    if(!doctorId){
      return res.status(400).json({success: false,message: 'Doctor ID is required'});
    }
    const doctor=await Doctor.findById(doctorId);
    if(!doctor){
      return res.status(404).json({success: false,message: 'Doctor not found'});
    }
    const connections= await ChatConnection.find({ doctor: doctorId }).populate('patient', 'name email profileImage');
    res.status(200).json({success: true,connections});
  }
  catch(error){
    console.error('Get connections list error:', error);
    res.status(500).json({success: false,message: 'Internal server error'});
  }
}
// Get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('-password -__v');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const updates = req.body;
    const doctorId = req.user.id;

    // Remove restricted fields
    delete updates.email;
    delete updates.password;
    delete updates._id;

    // If updating password, hash it
    if (updates.newPassword) {
      if (!updates.currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
      }

      const doctor = await Doctor.findById(doctorId);
      const isValidPassword = await bcrypt.compare(updates.currentPassword, doctor.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      updates.password = await bcrypt.hash(updates.newPassword, 10);
      delete updates.newPassword;
      delete updates.currentPassword;
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all doctors (for admin)
const getAllDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query)
      .select('-password -__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get available doctors for consultation
const getAvailableDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    
    const query = { 
      isOnline: true,
      isVerified: true 
    };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const doctors = await Doctor.find(query)
      .select('name specialization experience rating profileImage consultationFee')
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      data: doctors
    });

  } catch (error) {
    console.error('Get available doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Public: Get a doctor by id (safe)
const getDoctorByIdPublic = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    return res.status(200).json({
      success: true,
      data: doctor.getPublicProfile()
    });
  } catch (error) {
    console.error('Get doctor by id error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: Get doctor slots in a date range (default: today -> next 30 days)
// GET /doctors/:doctorId/slots?from=YYYY-MM-DD&to=YYYY-MM-DD&type=video|chat|voice|in-person
const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { from, to, type } = req.query;

    if (type && !SUPPORTED_CONSULTATION_TYPES.has(String(type))) {
      return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    const start = parseDateOnly(String(from || '')) || (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    const end = parseDateOnly(String(to || '')) || (() => {
      const d = new Date(start);
      d.setDate(d.getDate() + 30);
      d.setHours(23, 59, 59, 999);
      return d;
    })();

    if (end < start) {
      return res.status(400).json({ success: false, message: '`to` must be >= `from`' });
    }

    const doctor = await Doctor.findById(doctorId).select('slots');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const slots = (doctor.slots || [])
      .filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      })
      .filter((s) => (type ? s.type === type : true))
      .filter((s) => !s.isBooked)
      .sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        if (da !== db) return da - db;
        return String(a.time).localeCompare(String(b.time));
      })
      .map((s) => ({
        _id: s._id,
        date: s.date,
        time: s.time,
        type: s.type,
        isBooked: s.isBooked
      }));

    const byDay = new Map();
    for (const slot of slots) {
      const key = formatDateKey(new Date(slot.date));
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(slot);
    }

    const days = Array.from(byDay.entries()).map(([date, daySlots]) => ({ date, slots: daySlots }));

    return res.status(200).json({
      success: true,
      data: {
        doctorId,
        from: formatDateKey(start),
        to: formatDateKey(end),
        type: type || null,
        days
      }
    });
  } catch (error) {
    console.error('Get doctor slots error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Doctor-auth: Create slots (either explicit list or generated)
// POST /doctors/slots
// Body options:
//  A) { slots: [{ date:'YYYY-MM-DD', time:'HH:MM', type:'video' }, ...] }
//  B) { fromDate:'YYYY-MM-DD', toDate:'YYYY-MM-DD', times:['09:00','09:30'], type:'video', skipWeekends?:true }
const createDoctorSlots = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const {
      slots: explicitSlots,
      fromDate,
      toDate,
      times,
      type,
      skipWeekends
    } = req.body || {};

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const newSlots = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const existingKeys = new Set(
      (doctor.slots || []).map((s) => `${formatDateKey(new Date(s.date))}|${String(s.time)}|${String(s.type)}`)
    );

    if (Array.isArray(explicitSlots) && explicitSlots.length > 0) {
      for (const s of explicitSlots) {
        const d = parseDateOnly(String(s?.date || ''));
        const t = parseTimeHHMM(String(s?.time || ''));
        const ty = String(s?.type || '');
        if (!d || !t || !SUPPORTED_CONSULTATION_TYPES.has(ty)) {
          return res.status(400).json({ success: false, message: 'Invalid slots payload' });
        }
        if (d < now) {
          return res.status(400).json({ success: false, message: 'Cannot create slots in the past' });
        }
        const key = `${formatDateKey(d)}|${t.normalized}|${ty}`;
        if (existingKeys.has(key)) continue;
        existingKeys.add(key);
        newSlots.push({ date: d, time: t.normalized, type: ty, isBooked: false });
      }
    } else {
      const d1 = parseDateOnly(String(fromDate || ''));
      const d2 = parseDateOnly(String(toDate || ''));
      const ty = String(type || '');
      if (!d1 || !d2 || !Array.isArray(times) || times.length === 0 || !SUPPORTED_CONSULTATION_TYPES.has(ty)) {
        return res.status(400).json({ success: false, message: 'fromDate, toDate, times, type are required' });
      }
      if (d2 < d1) {
        return res.status(400).json({ success: false, message: '`toDate` must be >= `fromDate`' });
      }

      for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
        const day = new Date(d);
        day.setHours(0, 0, 0, 0);
        if (day < now) continue;
        if (skipWeekends && isWeekend(day)) continue;

        for (const timeValue of times) {
          const t = parseTimeHHMM(String(timeValue));
          if (!t) {
            return res.status(400).json({ success: false, message: `Invalid time: ${timeValue}` });
          }
          const key = `${formatDateKey(day)}|${t.normalized}|${ty}`;
          if (existingKeys.has(key)) continue;
          existingKeys.add(key);
          newSlots.push({ date: new Date(day), time: t.normalized, type: ty, isBooked: false });
        }
      }
    }

    if (newSlots.length === 0) {
      return res.status(200).json({ success: true, message: 'No new slots created', data: { created: 0 } });
    }

    doctor.slots = [...(doctor.slots || []), ...newSlots];
    await doctor.save();

    return res.status(201).json({
      success: true,
      message: 'Slots created successfully',
      data: { created: newSlots.length }
    });
  } catch (error) {
    console.error('Create doctor slots error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  registerDoctor,
  loginDoctor,
  getConnectionsList,
  getDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getAvailableDoctors,
  getDoctorByIdPublic,
  getDoctorSlots,
  createDoctorSlots
};