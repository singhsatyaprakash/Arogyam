import React from "react";
import {
  FaVideo,
  FaCalendarAlt,
  FaComments,
  FaCreditCard,
  FaShieldAlt,
  FaHeartbeat,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";
import Navbar from "../component/Navbar";

const About = () => {
  const features = [
    {
      icon: FaVideo,
      title: "Video Consultation",
      description:
        "Connect with doctors via secure HD video calls for face-to-face consultations",
    },
    {
      icon: FaCalendarAlt,
      title: "Smart Scheduling",
      description:
        "Easy appointment booking with real-time availability and calendar integration",
    },
    {
      icon: FaComments,
      title: "Instant Chat",
      description:
        "Direct messaging with doctors for quick consultations and follow-ups",
    },
    {
      icon: FaCreditCard,
      title: "Secure Payments",
      description:
        "Multiple payment options with encrypted transactions and secure storage",
    },
    {
      icon: FaShieldAlt,
      title: "Data Privacy",
      description:
        "End-to-end encryption ensuring safe medical records",
    },
    {
      icon: FaHeartbeat,
      title: "Health Records",
      description:
        "Digital medical history, prescriptions and medicine management",
    },
  ];

  const benefits = [
    {
      title: "For Patients",
      items: [
        "Access healthcare anytime, anywhere",
        "No waiting rooms or long queues",
        "Affordable consultation fees",
        "Prescription management",
        "Complete medical history tracking",
      ],
    },
    {
      title: "For Doctors",
      items: [
        "Reach more patients efficiently",
        "Manage appointments easily",
        "Digital patient records",
        "Secure patient communication",
        "Increase practice revenue",
      ],
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "500+", label: "Verified Doctors" },
    { number: "50K+", label: "Consultations" },
    { number: "95%", label: "User Satisfaction" },
  ];

  return (
    <>
      <Navbar />

      <div className="w-full bg-gray-50 text-gray-900 overflow-x-hidden">

        {/* HERO */}
        <section className="bg-gradient-to-r from-green-600 to-red-500 text-white py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About Arogyam</h1>

            <p className="text-2xl mb-6 font-light">
              Transforming Healthcare with Digital Innovation
            </p>

            <p className="text-lg opacity-90">
              Arogyam connects patients with verified doctors through a modern
              telemedicine platform for secure, affordable and accessible
              healthcare.
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Our Key Features
              </h2>
              <p className="text-gray-600 text-lg">
                Everything you need for seamless healthcare
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 p-8 rounded-xl text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300"
                  >
                    <Icon className="text-5xl text-green-600 mx-auto mb-4" />

                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 px-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold mb-4">
                How It Works
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {[
                { step: 1, title: "Sign Up", desc: "Create your account" },
                { step: 2, title: "Browse Doctors", desc: "Find specialists" },
                { step: 3, title: "Book Appointment", desc: "Choose schedule" },
                { step: 4, title: "Consult Online", desc: "Video or chat consultation" },
                { step: 5, title: "Get Prescription", desc: "Receive digital prescription" },
                { step: 6, title: "Follow Up", desc: "Stay connected" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition"
                >
                  <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center rounded-full mb-4 font-bold">
                    {item.step}
                  </div>

                  <h4 className="font-semibold text-lg mb-2">
                    {item.title}
                  </h4>

                  <p className="text-gray-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl border hover:shadow-lg"
              >
                <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
                  <FaUsers className="text-red-500" />
                  {benefit.title}
                </h3>

                <ul className="space-y-3">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </section>

        {/* STATS */}
        <section className="bg-green-600 text-white py-20 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur rounded-lg p-6 hover:scale-105 transition"
              >
                <h3 className="text-4xl font-bold">{stat.number}</h3>
                <p>{stat.label}</p>
              </div>
            ))}

          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-red-500 to-green-600 text-white py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">

            <h2 className="text-4xl font-bold mb-6">
              Ready for Better Healthcare?
            </h2>

            <p className="mb-10 text-lg opacity-90">
              Join thousands of patients and doctors already using Arogyam
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">

              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:scale-105 transition">
                Get Started
              </button>

              <button className="border-2 border-white px-8 py-4 rounded-lg hover:bg-white hover:text-red-500 transition">
                Learn More
              </button>

            </div>

          </div>
        </section>

      </div>
    </>
  );
};

export default About;