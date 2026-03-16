import React, { useState } from 'react'
import {
  FaSearch,
  FaBook,
  FaVideo,
  FaHeadset,
  FaCheckCircle,
  FaClock,
  FaLightbulb,
  FaShieldAlt,
  FaUser,
  FaCalendarAlt,
  FaCreditCard,
  FaLock,
  FaArrowRight,
  FaQuestionCircle,
} from 'react-icons/fa'

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'account', label: 'Account & Profile' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'payments', label: 'Payments' },
    { id: 'security', label: 'Security' },
    { id: 'technical', label: 'Technical Issues' },
  ]

  const helpTopics = [
    {
      icon: FaBook,
      title: 'Getting Started',
      description: 'Learn the basics and get started with Arogyam',
      articles: 6,
      color: '#FF6B6B',
    },
    {
      icon: FaVideo,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for all features',
      articles: 12,
      color: '#4ECDC4',
    },
    {
      icon: FaHeadset,
      title: 'Support',
      description: 'Get help from our support team',
      articles: 8,
      color: '#45B7D1',
    },
    {
      icon: FaClock,
      title: 'Appointments',
      description: 'Book, reschedule, or cancel appointments',
      articles: 10,
      color: '#FFA502',
    },
  ]

  const articles = [
    {
      id: 1,
      category: 'account',
      title: 'How to Create Your Account',
      description: 'Step-by-step guide to register and set up your profile',
      readTime: '3 min',
      views: '2.5K',
    },
    {
      id: 2,
      category: 'account',
      title: 'Update Your Profile Information',
      description: 'Learn how to edit your personal and medical details',
      readTime: '2 min',
      views: '1.2K',
    },
    {
      id: 3,
      category: 'appointments',
      title: 'Booking Your First Appointment',
      description: 'Complete guide to finding and booking a doctor',
      readTime: '5 min',
      views: '4.3K',
    },
    {
      id: 4,
      category: 'appointments',
      title: 'How to Reschedule an Appointment',
      description: 'Change your appointment date and time easily',
      readTime: '2 min',
      views: '3.1K',
    },
    {
      id: 5,
      category: 'payments',
      title: 'Payment Methods and Options',
      description: 'See all available payment options on Arogyam',
      readTime: '3 min',
      views: '2.8K',
    },
    {
      id: 6,
      category: 'payments',
      title: 'Understanding Your Invoice',
      description: 'Learn about charges and how to download receipts',
      readTime: '3 min',
      views: '1.9K',
    },
    {
      id: 7,
      category: 'security',
      title: 'Secure Your Account',
      description: 'Tips to keep your account and data safe',
      readTime: '4 min',
      views: '3.5K',
    },
    {
      id: 8,
      category: 'security',
      title: 'Data Privacy and Protection',
      description: 'How we protect your medical information',
      readTime: '5 min',
      views: '2.1K',
    },
    {
      id: 9,
      category: 'technical',
      title: 'Troubleshooting Connection Issues',
      description: 'Fix video call and connectivity problems',
      readTime: '4 min',
      views: '5.2K',
    },
  ]

  const filteredArticles =
    activeCategory === 'all'
      ? articles
      : articles.filter((article) => article.category === activeCategory)

  const searchedArticles = filteredArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login page and click "Forgot Password". Enter your email, and we\'ll send you instructions within 5 minutes.',
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account from Settings > Account > Delete Account. Your data will be securely removed.',
    },
    {
      question: 'How long are consultations?',
      answer: 'Standard consultations are 15-30 minutes. The doctor will discuss the duration during booking.',
    },
    {
      question: 'What if I miss an appointment?',
      answer: 'You can join within 30 minutes of the scheduled time. If missed, you can reschedule or request a refund.',
    },
  ]

  const guides = [
    {
      icon: FaUser,
      title: 'Complete Profile Setup',
      description: 'Set up your medical history and emergency contacts',
      steps: 5,
    },
    {
      icon: FaCalendarAlt,
      title: 'Scheduling Your Appointment',
      description: 'Find doctors and book your first consultation',
      steps: 4,
    },
    {
      icon: FaCreditCard,
      title: 'Making Payments',
      description: 'Payment methods and billing information',
      steps: 3,
    },
    {
      icon: FaLock,
      title: 'Security Settings',
      description: 'Protect your account with security features',
      steps: 6,
    },
  ]

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-10 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-1/3 -left-5 w-80 h-80 bg-white rounded-full opacity-10 blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">Help Center</h1>
          <p className="text-xl sm:text-2xl font-light mb-10">Find answers and get support</p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              <FaSearch className="text-gray-400 ml-6" size={20} />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 outline-none text-gray-800 text-lg placeholder-gray-400"
              />
              <button className="bg-indigo-600 text-white px-6 py-4 hover:bg-indigo-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Help Topics */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Topic</h2>
            <p className="text-xl text-gray-600">Quick access to help categories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpTopics.map((topic, index) => {
              const Icon = topic.icon
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center"
                >
                  <div className="text-5xl mb-4 flex justify-center" style={{ color: topic.color }}>
                    <Icon />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{topic.description}</p>
                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                    <span>{topic.articles} Articles</span>
                    <FaArrowRight size={14} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Guides */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quick Guides</h2>
            <p className="text-xl text-gray-600">Step-by-step instructions for common tasks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guides.map((guide, index) => {
              const Icon = guide.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl text-indigo-600 flex-shrink-0">
                      <Icon />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h3>
                      <p className="text-gray-600 mb-4">{guide.description}</p>
                      <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold cursor-pointer hover:gap-3 transition-all">
                        <span>{guide.steps} Steps</span>
                        <FaArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">All Articles</h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {searchedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchedArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
                      {article.category.replace('-', ' ')}
                    </span>
                    <span className="text-gray-400 text-sm">{article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{article.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{article.views} views</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaQuestionCircle className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No articles found for "{searchQuery}"</p>
              <p className="text-gray-500">Try searching with different keywords</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Tutorials Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Video Tutorials</h2>
            <p className="text-xl text-gray-600">Watch step-by-step guides</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Getting Started with Arogyam', duration: '5:42' },
              { title: 'Booking Your First Appointment', duration: '4:28' },
              { title: 'Video Consultation Guide', duration: '6:15' },
              { title: 'Payment & Billing', duration: '3:55' },
              { title: 'Account Settings', duration: '4:10' },
              { title: 'Medical Records Management', duration: '5:30' },
            ].map((video, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 h-40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <div className="text-white text-6xl opacity-80 group-hover:opacity-100 transition-opacity">
                    <FaVideo />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-gray-50 border border-gray-200 rounded-lg p-6 hover:bg-gray-100 transition-all duration-300 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-bold text-gray-900 text-lg">
                  <span>{faq.question}</span>
                  <span className="ml-4 text-indigo-600 group-open:rotate-180 transition-transform duration-300">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-700 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-10 text-center">
            <FaHeadset className="text-6xl mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg mb-8 opacity-90">
              Our support team is available 24/7 to answer your questions and help you get the most out of Arogyam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 hover:-translate-y-1 transition-all duration-300">
                Contact Support
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-indigo-600 hover:-translate-y-1 transition-all duration-300">
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Help
