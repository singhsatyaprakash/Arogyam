import React, { useState } from 'react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane, FaCheckCircle } from 'react-icons/fa'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would send the form data to your backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone',
      details: '+91-9999-999-999',
      subtext: 'Mon-Fri: 9:00 AM - 6:00 PM',
      color: '#FF6B6B',
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      details: 'support@arogyam.com',
      subtext: 'We respond within 24 hours',
      color: '#4ECDC4',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Address',
      details: 'Arogyam Healthcare, Mumbai',
      subtext: 'India',
      color: '#45B7D1',
    },
    {
      icon: FaClock,
      title: 'Support Hours',
      details: '24/7 Available',
      subtext: 'Emergency support always open',
      color: '#FFA502',
    },
  ]

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment through our app or website by selecting a doctor, choosing your preferred date and time, and completing the payment process.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, net banking, and digital wallets for secure and convenient payments.',
    },
    {
      question: 'Is my medical data secure?',
      answer: 'Yes, we use HIPAA-compliant encryption and end-to-end secure protocols to protect all your medical records and personal information.',
    },
    {
      question: 'How can I reschedule an appointment?',
      answer: 'You can reschedule from your patient dashboard up to 24 hours before your appointment or contact our support team.',
    },
    {
      question: 'Do you provide prescription medications?',
      answer: 'Doctors can prescribe medications during consultations. You can purchase them from any pharmacy or use our partner pharmacies.',
    },
    {
      question: 'Can I connect on multiple devices?',
      answer: 'Yes, your account works seamlessly across web, iOS, and Android platforms with automatic synchronization.',
    },
  ]

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-10 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-1/3 -left-5 w-80 h-80 bg-white rounded-full opacity-10 blur-3xl"></div>
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl sm:text-2xl font-light">Get in touch with our team. We're here to help!</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-4 flex justify-center" style={{ color: info.color }}>
                    <Icon />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-gray-700 font-semibold mb-1">{info.details}</p>
                  <p className="text-gray-500 text-sm">{info.subtext}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>

              {submitted && (
                <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <div>
                    <p className="text-green-700 font-semibold">Message Sent!</p>
                    <p className="text-green-600 text-sm">Thank you for contacting us. We'll respond within 24 hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9999-999-999"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaPaperPlane />
                  Send Message
                </button>
              </form>
            </div>

            {/* Info Box */}
            <div className="space-y-8">
              {/* Why Choose Us */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Arogyam?</h3>
                <ul className="space-y-4">
                  {[
                    'Experienced doctors and healthcare professionals',
                    'Secure and confidential consultations',
                    'Affordable and transparent pricing',
                    'Fast response and professional support',
                    'Available 24/7 for emergencies',
                    'Advanced telemedicine technology',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
                <p className="mb-6 text-indigo-100">Stay updated with the latest health tips and news</p>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { icon: FaFacebook, label: 'Facebook' },
                    { icon: FaTwitter, label: 'Twitter' },
                    { icon: FaInstagram, label: 'Instagram' },
                    { icon: FaLinkedin, label: 'LinkedIn' },
                  ].map((social, index) => {
                    const Icon = social.icon
                    return (
                      <button
                        key={index}
                        className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110"
                        aria-label={social.label}
                      >
                        <Icon size={24} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Find quick answers to common questions</p>
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

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 opacity-95">Our support team is available 24/7 to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-red-500 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 hover:-translate-y-1 transition-all duration-300">
              Live Chat
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-red-500 hover:-translate-y-1 transition-all duration-300">
              Schedule Call
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
