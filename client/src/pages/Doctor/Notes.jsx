// Notes.jsx
import React, { useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import { FaStickyNote, FaPlus, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';

const Notes = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Patient Care Protocols',
      date: '2024-12-14',
      content: 'Updated guidelines for diabetes management. Remember to check HbA1c quarterly and adjust medication accordingly.',
      category: 'guidelines'
    },
    {
      id: 2,
      title: 'Meeting Notes',
      date: '2024-12-13',
      content: 'Discussion with cardiology department about new referral procedures and collaborative care models.',
      category: 'meeting'
    },
    {
      id: 3,
      title: 'Research Findings',
      date: '2024-12-12',
      content: 'New study on hypertension treatment shows promising results with combination therapy.',
      category: 'research'
    }
  ]);

  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' });
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const saveNote = () => {
    if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote.id ? { ...editingNote, ...newNote } : note
      ));
      setEditingNote(null);
    } else {
      setNotes([...notes, {
        id: notes.length + 1,
        ...newNote,
        date: new Date().toISOString().split('T')[0]
      }]);
    }
    setNewNote({ title: '', content: '', category: 'general' });
    setShowForm(false);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content, category: note.category });
    setShowForm(true);
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
                <FaStickyNote className="text-red-500" />
                Clinical Notes
              </h2>
              <p className="text-gray-500 mt-1">Document patient insights and protocols</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              <FaPlus />
              New Note
            </button>
          </div>

          {/* Add/Edit Note Form */}
          {showForm && (
            <div className="mb-6 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title of your note..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <textarea
                  placeholder="Write your notes here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="w-full h-48 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                >
                  <option value="general">General</option>
                  <option value="patient">Patient Notes</option>
                  <option value="meeting">Meeting Notes</option>
                  <option value="research">Research</option>
                  <option value="guidelines">Guidelines</option>
                </select>
                <div className="flex flex-col-reverse sm:flex-row gap-2">
                  <button
                    onClick={saveNote}
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition"
                  >
                    {editingNote ? 'Update Note' : 'Save Note'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingNote(null);
                      setNewNote({ title: '', content: '', category: 'general' });
                    }}
                    className="border border-gray-300 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{note.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendarAlt />
                        {new Date(`${note.date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      note.category === 'patient' ? 'bg-blue-100 text-blue-700' :
                      note.category === 'meeting' ? 'bg-purple-100 text-purple-700' :
                      note.category === 'research' ? 'bg-emerald-100 text-emerald-700' :
                      note.category === 'guidelines' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {note.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 line-clamp-3 min-h-[72px]">{note.content}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="text-red-500 hover:text-red-600 font-medium text-sm">
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm">Total Notes</h3>
              <p className="text-2xl font-bold text-gray-800">{notes.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-sky-200">
              <h3 className="text-gray-500 text-sm">This Month</h3>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-200">
              <h3 className="text-gray-500 text-sm">Patient Notes</h3>
              <p className="text-2xl font-bold text-green-600">1</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-200">
              <h3 className="text-gray-500 text-sm">Last Updated</h3>
              <p className="text-2xl font-bold text-red-600">Today</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notes;