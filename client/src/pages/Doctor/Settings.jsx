// Settings.jsx
import React, { useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import { 
  FaUser, 
  FaBell, 
  FaShieldAlt, 
  FaCreditCard, 
  FaLanguage,
  FaMoon,
  FaSave,
  FaUpload,
  FaIdBadge,
  FaClock,
  FaLock,
  FaCheckCircle
} from 'react-icons/fa';

const Settings = () => {
  const [settings, setSettings] = useState({
    profile: {
      name: 'Dr. Satyal',
      email: 'dr.satyal@medicare.com',
      phone: '+1 (555) 123-4567',
      specialization: 'Cardiology',
      bio: 'Senior Cardiologist with 15+ years of experience in hypertension management.'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      appointmentReminders: true,
      chatNotifications: true,
      newsletter: false
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: '30',
      loginAlerts: true
    },
    appearance: {
      theme: 'light',
      language: 'english',
      fontSize: 'medium'
    },
    appointments: {
      slotDuration: 30,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      startTime: '09:00',
      endTime: '17:00'
    },
    verification: {
      isVerified: false,
      licenseNumber: '',
      degree: '',
      experienceYears: '',
      documents: [] // { name, url(optional) }
    },
    password: {
      current: '',
      new: '',
      confirm: ''
    }
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState(null);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleVerificationUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const docs = files.map(file => ({
      name: file.name,
      file
    }));
    setSettings(prev => ({
      ...prev,
      verification: {
        ...prev.verification,
        documents: [...prev.verification.documents, ...docs]
      }
    }));
  };

  const removeVerificationDocument = (index) => {
    setSettings(prev => {
      const docs = [...prev.verification.documents];
      docs.splice(index, 1);
      return {
        ...prev,
        verification: {
          ...prev.verification,
          documents: docs
        }
      };
    });
  };

  const changePassword = () => {
    const { current, new: newPwd, confirm } = settings.password;
    if (!current || !newPwd || newPwd !== confirm) {
      alert('Please ensure passwords are filled and new password matches confirmation.');
      return;
    }
    alert('Password change requested (placeholder).');
    setSettings(prev => ({ ...prev, password: { current: '', new: '', confirm: '' } }));
  };

  const saveSettings = () => {
    alert('Settings saved successfully!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      
      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, {settings.profile.name}</h1>
            <p className="text-gray-500">Friday, December 19, 2025</p>
          </div>

          {/* Verification banner prompt if not verified */}
          {!settings.verification.isVerified && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaIdBadge className="text-yellow-600 text-2xl" />
                <div>
                  <div className="font-medium text-yellow-800">Complete your verification</div>
                  <div className="text-sm text-yellow-700">Upload your degree, license and experience documents to verify your account and enable appointments.</div>
                </div>
              </div>
              <button onClick={() => setActiveTab('verification')} className="bg-yellow-600 text-white px-4 py-2 rounded-md">Verify Now</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-700">Settings</h3>
                </div>
                <div className="p-2">
                  {[
                    { id: 'profile', label: 'Profile', icon: FaUser },
                    { id: 'notifications', label: 'Notifications', icon: FaBell },
                    { id: 'security', label: 'Security', icon: FaShieldAlt },
                    { id: 'appointments', label: 'Appointments', icon: FaClock },
                    { id: 'password', label: 'Password', icon: FaLock },
                    { id: 'verification', label: 'Verification', icon: FaIdBadge },
                    { id: 'billing', label: 'Billing', icon: FaCreditCard },
                    { id: 'appearance', label: 'Appearance', icon: FaMoon },
                    { id: 'language', label: 'Language', icon: FaLanguage }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 ${
                        activeTab === tab.id
                          ? 'bg-red-50 text-red-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  {/* Profile Settings */}
                  {activeTab === 'profile' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <FaUser />
                        Profile Settings
                      </h3>
                      
                      <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex flex-col items-center">
                          <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center mb-4 overflow-hidden">
                            {profileImage ? (
                              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <FaUser className="text-red-500 text-5xl" />
                            )}
                          </div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <div className="flex items-center gap-2 text-red-500 hover:text-red-600">
                              <FaUpload />
                              Upload Photo
                            </div>
                          </label>
                        </div>
                        
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                value={settings.profile.name}
                                onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={settings.profile.email}
                                onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={settings.profile.phone}
                                onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Specialization
                              </label>
                              <input
                                type="text"
                                value={settings.profile.specialization}
                                onChange={(e) => handleInputChange('profile', 'specialization', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bio
                            </label>
                            <textarea
                              value={settings.profile.bio}
                              onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                              className="w-full h-32 p-3 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <FaBell />
                        Notification Preferences
                      </h3>
                      
                      <div className="space-y-4">
                        {Object.entries(settings.notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium text-gray-800 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {key === 'emailNotifications' && 'Receive notifications via email'}
                                {key === 'pushNotifications' && 'Receive push notifications on this device'}
                                {key === 'appointmentReminders' && 'Get reminded before appointments'}
                                {key === 'chatNotifications' && 'Notify when new messages arrive'}
                                {key === 'newsletter' && 'Receive medical updates and newsletters'}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <FaShieldAlt />
                        Security Settings
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.security.twoFactorAuth}
                                onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2">Session Timeout</h4>
                          <p className="text-sm text-gray-500 mb-3">Automatically log out after period of inactivity</p>
                          <select
                            value={settings.security.sessionTimeout}
                            onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                          </select>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800">Login Alerts</h4>
                              <p className="text-sm text-gray-500">Get notified of new logins to your account</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.security.loginAlerts}
                                onChange={(e) => handleInputChange('security', 'loginAlerts', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appointments Settings */}
                  {activeTab === 'appointments' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <FaClock />
                        Appointment Availability
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                          <div className="flex flex-wrap gap-2">
                            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
                              const active = settings.appointments.workingDays.includes(day);
                              return (
                                <button
                                  key={day}
                                  onClick={() => {
                                    const days = new Set(settings.appointments.workingDays);
                                    if (days.has(day)) days.delete(day); else days.add(day);
                                    handleInputChange('appointments', 'workingDays', Array.from(days));
                                  }}
                                  className={`px-3 py-1 rounded-full border ${active ? 'bg-red-50 text-red-600' : 'text-gray-600'}`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                          <div className="flex items-center gap-2">
                            <input type="time" value={settings.appointments.startTime} onChange={(e) => handleInputChange('appointments', 'startTime', e.target.value)} className="p-2 border rounded-md" />
                            <span className="text-gray-400">to</span>
                            <input type="time" value={settings.appointments.endTime} onChange={(e) => handleInputChange('appointments', 'endTime', e.target.value)} className="p-2 border rounded-md" />
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                            <input type="number" min="5" value={settings.appointments.slotDuration} onChange={(e) => handleInputChange('appointments', 'slotDuration', Number(e.target.value))} className="w-32 p-2 border rounded-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Change */}
                  {activeTab === 'password' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <FaLock />
                        Change Password
                      </h3>

                      <div className="max-w-md space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input type="password" value={settings.password.current} onChange={(e) => handleInputChange('password', 'current', e.target.value)} className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input type="password" value={settings.password.new} onChange={(e) => handleInputChange('password', 'new', e.target.value)} className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input type="password" value={settings.password.confirm} onChange={(e) => handleInputChange('password', 'confirm', e.target.value)} className="w-full p-3 border rounded-lg" />
                        </div>

                        <div className="pt-2">
                          <button onClick={changePassword} className="bg-red-500 text-white px-4 py-2 rounded-md">Change Password</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification Settings */}
                  {activeTab === 'verification' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <FaIdBadge />
                        Verification & Documents
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                          <input type="text" value={settings.verification.licenseNumber} onChange={(e) => handleInputChange('verification', 'licenseNumber', e.target.value)} className="w-full p-3 border rounded-lg" />

                          <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Degree / Qualification</label>
                          <input type="text" value={settings.verification.degree} onChange={(e) => handleInputChange('verification', 'degree', e.target.value)} className="w-full p-3 border rounded-lg" />

                          <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Years of Experience</label>
                          <input type="number" min="0" value={settings.verification.experienceYears} onChange={(e) => handleInputChange('verification', 'experienceYears', e.target.value)} className="w-full p-3 border rounded-lg" />
                        </div>

                        <div className="p-4 border rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents (degree, license, experience letters)</label>
                          <label className="cursor-pointer inline-flex items-center gap-2 text-red-500">
                            <FaUpload />
                            <span className="underline">Select files</span>
                            <input type="file" multiple accept="image/*,application/pdf" onChange={handleVerificationUpload} className="hidden" />
                          </label>

                          <div className="mt-4 space-y-2">
                            {settings.verification.documents.length === 0 && <div className="text-sm text-gray-500">No documents uploaded yet.</div>}
                            {settings.verification.documents.map((doc, i) => (
                              <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="text-sm truncate">{doc.name}</div>
                                <div className="flex items-center gap-2">
                                  {/* preview/download placeholder */}
                                  <button onClick={() => removeVerificationDocument(i)} className="text-sm text-red-600">Remove</button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4">
                            <button onClick={() => { /* placeholder: submit verification */ alert('Verification submitted (placeholder)'); }} className="bg-yellow-600 text-white px-4 py-2 rounded-md">Submit for Review</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appearance Settings */}
                  {activeTab === 'appearance' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <FaMoon />
                        Appearance Settings
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-3">Theme</h4>
                          <div className="space-y-2">
                            {['light', 'dark', 'auto'].map((theme) => (
                              <label key={theme} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="theme"
                                  value={theme}
                                  checked={settings.appearance.theme === theme}
                                  onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                                  className="text-red-500 focus:ring-red-500"
                                />
                                <span className="capitalize">{theme} mode</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-3">Font Size</h4>
                          <select
                            value={settings.appearance.fontSize}
                            onChange={(e) => handleInputChange('appearance', 'fontSize', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="xlarge">Extra Large</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="mt-8 pt-6 border-t">
                    <button
                      onClick={saveSettings}
                      className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <FaSave />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main> 
    </div>
  );
};

export default Settings;