// ShareIdeas.jsx
import React, { useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import { FaLightbulb, FaPaperPlane, FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';

const ShareIdeas = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Managing Hypertension in Elderly Patients',
      author: 'Dr. Robert Chen',
      date: '2024-12-12',
      content: 'A comprehensive approach to managing hypertension in patients over 65, focusing on combination therapy and lifestyle modifications.',
      likes: 24,
      comments: 8,
      shares: 5
    },
    {
      id: 2,
      title: 'Innovative Diabetes Care Models',
      author: 'Dr. Sarah Miller',
      date: '2024-12-11',
      content: 'Exploring new care delivery models for diabetes management in rural communities.',
      likes: 18,
      comments: 5,
      shares: 3
    },
    {
      id: 3,
      title: 'Telemedicine Best Practices',
      author: 'Dr. James Wilson',
      date: '2024-12-10',
      content: 'Effective strategies for conducting remote consultations and maintaining patient engagement.',
      likes: 32,
      comments: 12,
      shares: 7
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });

  const [showForm, setShowForm] = useState(false);

  const publishPost = () => {
    if (newPost.title && newPost.content) {
      setPosts([
        {
          id: posts.length + 1,
          title: newPost.title,
          author: 'Dr. Satyal',
          date: new Date().toISOString().split('T')[0],
          content: newPost.content,
          likes: 0,
          comments: 0,
          shares: 0
        },
        ...posts
      ]);
      setNewPost({ title: '', content: '' });
      setShowForm(false);
    }
  };

  const likePost = (id) => {
    setPosts(posts.map(post =>
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const totalShares = posts.reduce((sum, post) => sum + post.shares, 0);
  const communityReach = totalLikes + totalShares * 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-orange-50/40">
      <DoctorNavbar />
      
      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8 rounded-2xl sm:rounded-3xl border border-rose-100 bg-white/90 p-5 sm:p-6 shadow-sm backdrop-blur">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <FaLightbulb />
              </span>
              Share Your Ideas & Solutions
            </h2>
            <p className="text-gray-600 mt-2">Help the medical community grow through practical clinical insights</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-rose-700">Knowledge Exchange</span>
              <span className="text-xs rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-sky-700">Clinical Tips</span>
              <span className="text-xs rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700">Community Impact</span>
            </div>
          </div>

          {/* Create Post Form */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <FaLightbulb className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Dr. Satyal</h3>
                <p className="text-sm text-gray-500">Cardiologist</p>
              </div>
            </div>

            {showForm ? (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title of your post..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl text-lg font-medium focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <textarea
                  placeholder="Share your ideas, solutions, and best practices for patient care..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full h-44 sm:h-48 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <div className="flex flex-col-reverse sm:flex-row gap-2">
                  <button
                    onClick={publishPost}
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition flex items-center justify-center gap-2"
                  >
                    <FaPaperPlane />
                    Publish Post
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="border border-gray-300 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  onClick={() => setShowForm(true)}
                  className="p-5 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-red-300 hover:bg-red-50/60 transition text-center"
                >
                  <FaLightbulb className="text-red-500 text-2xl mx-auto mb-2" />
                  <p className="text-gray-700 font-medium">Click here to share your ideas with the medical community</p>
                  <p className="text-sm text-gray-500 mt-1">Your insights can help improve patient care worldwide</p>
                </div>
              </div>
            )}
          </div>

          {/* Community Posts */}
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Community Posts</h3>
            
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg mb-1">{post.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="font-medium">{post.author}</span>
                        <span>{new Date(`${post.date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Cardiology
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">{post.content}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-5">
                      <button
                        onClick={() => likePost(post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
                      >
                        <FaThumbsUp />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
                        <FaComment />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition">
                        <FaShare />
                        <span>{post.shares}</span>
                      </button>
                    </div>
                    <button className="text-red-500 hover:text-red-600 font-semibold text-sm sm:text-base transition">
                      Read Full Article →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <FaLightbulb className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Total Posts</h3>
                  <p className="text-2xl font-bold text-gray-800">{posts.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <FaThumbsUp className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Total Likes</h3>
                  <p className="text-2xl font-bold text-gray-800">{totalLikes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <FaShare className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Community Reach</h3>
                  <p className="text-2xl font-bold text-gray-800">{communityReach}+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShareIdeas;