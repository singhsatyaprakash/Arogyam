// CaseStudies.jsx
import React, { useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import { FaBookMedical, FaPlus, FaEye, FaDownload, FaShareAlt } from 'react-icons/fa';

const CaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState([
    {
      id: 1,
      title: 'Complex Hypertension Management',
      patient: 'John Doe',
      age: 58,
      condition: 'Resistant Hypertension',
      date: '2024-12-15',
      status: 'published',
      views: 124
    },
    {
      id: 2,
      title: 'Diabetes with Cardiac Complications',
      patient: 'Sarah Smith',
      age: 45,
      condition: 'Type 2 Diabetes',
      date: '2024-12-10',
      status: 'draft',
      views: 0
    },
    {
      id: 3,
      title: 'Post-Operative Care Protocol',
      patient: 'Michael Brown',
      age: 62,
      condition: 'Cardiac Surgery',
      date: '2024-12-05',
      status: 'published',
      views: 89
    }
  ]);

  const [newStudy, setNewStudy] = useState({
    title: '',
    patient: '',
    age: '',
    condition: '',
    details: ''
  });

  const [showForm, setShowForm] = useState(false);

  const addCaseStudy = () => {
    if (newStudy.title && newStudy.patient) {
      setCaseStudies([
        ...caseStudies,
        {
          id: caseStudies.length + 1,
          ...newStudy,
          date: new Date().toISOString().split('T')[0],
          status: 'draft',
          views: 0
        }
      ]);
      setNewStudy({ title: '', patient: '', age: '', condition: '', details: '' });
      setShowForm(false);
    }
  };

  const publishStudy = (id) => {
    setCaseStudies(caseStudies.map(study =>
      study.id === id ? { ...study, status: 'published' } : study
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-orange-50/40">
      <DoctorNavbar />
      
      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Header */}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FaBookMedical className="text-red-500" />
                Case Studies
              </h2>
              <p className="text-gray-500 mt-1">Document and share clinical cases</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-rose-700">Clinical evidence</span>
                <span className="text-xs rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-sky-700">Peer sharing</span>
                <span className="text-xs rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700">Outcome tracking</span>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              <FaPlus />
              New Case Study
            </button>
          </div>

          {/* Add Case Study Form */}
          {showForm && (
            <div className="mb-6 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Case Study</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Case Study Title"
                  value={newStudy.title}
                  onChange={(e) => setNewStudy({...newStudy, title: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Patient Name (Anonymous)"
                  value={newStudy.patient}
                  onChange={(e) => setNewStudy({...newStudy, patient: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <input
                  type="number"
                  placeholder="Patient Age"
                  value={newStudy.age}
                  onChange={(e) => setNewStudy({...newStudy, age: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Medical Condition"
                  value={newStudy.condition}
                  onChange={(e) => setNewStudy({...newStudy, condition: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <textarea
                  placeholder="Case Details, Treatment, and Outcomes"
                  value={newStudy.details}
                  onChange={(e) => setNewStudy({...newStudy, details: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl h-32 md:col-span-2 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
                <button
                  onClick={addCaseStudy}
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Case Studies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Case Studies List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-orange-50">
                  <h3 className="font-semibold text-gray-800">My Case Studies</h3>
                </div>
                <div className="divide-y">
                  {caseStudies.map((study) => (
                    <div key={study.id} className="p-4 sm:p-5 hover:bg-gray-50/80 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800 leading-tight">{study.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>Patient: {study.patient}</span>
                            <span>Age: {study.age}</span>
                            <span>{study.condition}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          study.status === 'published' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {study.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaEye />
                            {study.views} views
                          </span>
                          <span>{new Date(`${study.date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex gap-2">
                          {study.status === 'draft' && (
                            <button
                              onClick={() => publishStudy(study.id)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                            >
                              Publish
                            </button>
                          )}
                          <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <FaDownload />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <FaShareAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistics and Actions */}
            <div className="space-y-5">
              {/* Statistics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Case Study Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Studies</span>
                    <span className="font-semibold text-gray-800">{caseStudies.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Published</span>
                    <span className="font-semibold text-green-600">
                      {caseStudies.filter(s => s.status === 'published').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-semibold text-blue-600">
                      {caseStudies.reduce((sum, study) => sum + study.views, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Views</span>
                    <span className="font-semibold text-purple-600">
                      {Math.round(caseStudies.reduce((sum, study) => sum + study.views, 0) / caseStudies.length) || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    Export All Studies
                  </button>
                  <button className="w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    Share with Community
                  </button>
                  <button className="w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    Request Peer Review
                  </button>
                  <button className="w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    View Analytics
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaEye className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Study viewed by 5 doctors</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaDownload className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Study downloaded 3 times</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
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

export default CaseStudies;