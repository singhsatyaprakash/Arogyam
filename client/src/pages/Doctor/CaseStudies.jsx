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
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      
      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, Dr. Satyal</h1>
            <p className="text-gray-500">Friday, December 19, 2025</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <FaBookMedical className="text-red-500" />
                Case Studies
              </h2>
              <p className="text-gray-500">Document and share clinical cases</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
            >
              <FaPlus />
              New Case Study
            </button>
          </div>

          {/* Add Case Study Form */}
          {showForm && (
            <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Create New Case Study</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Case Study Title"
                  value={newStudy.title}
                  onChange={(e) => setNewStudy({...newStudy, title: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Patient Name (Anonymous)"
                  value={newStudy.patient}
                  onChange={(e) => setNewStudy({...newStudy, patient: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Patient Age"
                  value={newStudy.age}
                  onChange={(e) => setNewStudy({...newStudy, age: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Medical Condition"
                  value={newStudy.condition}
                  onChange={(e) => setNewStudy({...newStudy, condition: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="Case Details, Treatment, and Outcomes"
                  value={newStudy.details}
                  onChange={(e) => setNewStudy({...newStudy, details: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg h-32 md:col-span-2"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={addCaseStudy}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Case Studies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case Studies List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-700">My Case Studies</h3>
                </div>
                <div className="divide-y">
                  {caseStudies.map((study) => (
                    <div key={study.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{study.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>Patient: {study.patient}</span>
                            <span>Age: {study.age}</span>
                            <span>{study.condition}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          study.status === 'published' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {study.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaEye />
                            {study.views} views
                          </span>
                          <span>{study.date}</span>
                        </div>
                        <div className="flex gap-2">
                          {study.status === 'draft' && (
                            <button
                              onClick={() => publishStudy(study.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                            >
                              Publish
                            </button>
                          )}
                          <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <FaDownload />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg">
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
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-gray-700 mb-4">Case Study Statistics</h3>
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
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-gray-700 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                    Export All Studies
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                    Share with Community
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                    Request Peer Review
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                    View Analytics
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-gray-700 mb-4">Recent Activity</h3>
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