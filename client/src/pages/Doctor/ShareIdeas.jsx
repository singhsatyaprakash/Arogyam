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

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      
      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, Dr. Satyal</h1>
            <p className="text-gray-500">Friday, December 19, 2025</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaLightbulb className="text-red-500" />
              Share Your Ideas & Solutions
            </h2>
            <p className="text-gray-500">Help the medical community grow</p>
          </div>

          {/* Create Post Form */}
          <div className="mb-8 bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
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
                  className="w-full p-3 border border-gray-300 rounded-lg text-lg font-medium"
                />
                <textarea
                  placeholder="Share your ideas, solutions, and best practices for patient care..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full h-48 p-3 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={publishPost}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <FaPaperPlane />
                    Publish Post
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  onClick={() => setShowForm(true)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition text-center"
                >
                  <FaLightbulb className="text-red-500 text-2xl mx-auto mb-2" />
                  <p className="text-gray-600">Click here to share your ideas with the medical community</p>
                  <p className="text-sm text-gray-500 mt-1">Your insights can help improve patient care worldwide</p>
                </div>
              </div>
            )}
          </div>

          {/* Community Posts */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Community Posts</h3>
            
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg mb-1">{post.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium">{post.author}</span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        Cardiology
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{post.content}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => likePost(post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-500"
                      >
                        <FaThumbsUp />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                        <FaComment />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-500">
                        <FaShare />
                        <span>{post.shares}</span>
                      </button>
                    </div>
                    <button className="text-red-500 hover:text-red-600 font-medium">
                      Read Full Article →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaLightbulb className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Total Posts</h3>
                  <p className="text-2xl font-bold text-gray-800">{posts.length + 1}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaThumbsUp className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Total Likes</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {posts.reduce((sum, post) => sum + post.likes, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaShare className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Community Reach</h3>
                  <p className="text-2xl font-bold text-gray-800">500+</p>
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