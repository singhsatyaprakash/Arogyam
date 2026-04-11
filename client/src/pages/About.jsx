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
  FaArrowRight,
  FaStar,
  FaLock,
} from "react-icons/fa";
import { Link } from "react-router-dom";
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

  const steps = [
    { step: "01", title: "Sign Up", desc: "Create your account in a few taps." },
    { step: "02", title: "Browse Doctors", desc: "Filter by specialty, timing, and ratings." },
    { step: "03", title: "Book Appointment", desc: "Reserve a slot that fits your schedule." },
    { step: "04", title: "Consult Online", desc: "Meet via secure video or chat." },
    { step: "05", title: "Get Prescription", desc: "Receive your digital prescription instantly." },
    { step: "06", title: "Follow Up", desc: "Stay connected for reviews and next steps." },
  ];

  return (
    <>
      <Navbar />

      <div className="w-full bg-gradient-to-b from-emerald-50/70 via-white to-cyan-50/60 text-gray-900 overflow-x-hidden">

        {/* HERO */}
          <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.20),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(244,63,94,0.16),_transparent_30%),linear-gradient(135deg,_rgba(236,253,245,0.92)_0%,_rgba(255,255,255,0.95)_45%,_rgba(236,254,255,0.88)_100%)] px-6 py-20 sm:py-24 lg:py-28">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm text-emerald-700 shadow-sm backdrop-blur">
                <FaShieldAlt className="text-emerald-300" />
                Secure telemedicine for everyday care
              </div>

              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Healthcare that feels immediate, simple, and trustworthy.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
                Arogyam connects patients with verified doctors through a
                modern telemedicine platform built for secure, affordable, and
                accessible care.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register/patient"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-emerald-300"
                >
                  Get Started as Patient
                  <FaArrowRight />
                </Link>

                <Link
                  to="/register/doctor"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-400 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-rose-300"
                >
                  Join as Doctor
                  <FaArrowRight />
                </Link>

                <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50">
                  Learn More
                </button>
              </div>

              <div className="mt-10 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2">
                  <FaLock className="text-emerald-300" /> End-to-end privacy
                </div>
                <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-white/90 px-4 py-2">
                  <FaStar className="text-amber-300" /> Trusted by thousands
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-emerald-400/10 blur-3xl" />
              <div className="relative rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-emerald-100 bg-white p-5"
                    >
                      <p className="text-3xl font-semibold text-gray-900">
                        {stat.number}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-rose-50 p-5">
                  <p className="text-sm uppercase tracking-[0.28em] text-gray-500">
                    Better care flow
                  </p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    One place for appointments, chat, payments, and prescriptions.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Designed to reduce friction for patients while giving doctors a
                    clean, efficient workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
                What You Get
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-4xl">
                Key capabilities that make care smoother.
              </h2>
              <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
                Everything is organized around faster access, clearer communication,
                and safer handling of healthcare data.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className="group rounded-3xl border border-emerald-100 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300"
                  >
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition group-hover:scale-105">
                      <Icon className="text-2xl" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">
                Simple Flow
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-4xl">
                How it works from first click to follow-up.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/70 transition hover:-translate-y-1 hover:border-rose-300"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-amber-300 text-lg font-bold text-slate-950">
                      {item.step}
                    </div>

                    <div className="ml-4 h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                  </div>

                    <h4 className="text-xl font-semibold text-gray-900">{item.title}</h4>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">

            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
              >
                <h3 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                    <FaUsers />
                  </span>
                  {benefit.title}
                </h3>

                <ul className="mt-7 space-y-4">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600">
                      <FaCheckCircle className="mt-1 text-emerald-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </section>

        {/* STATS */}
        <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-16 text-slate-950 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 text-center md:grid-cols-4">

            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/25 bg-white/20 p-6 shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-1"
              >
                <h3 className="text-3xl font-semibold sm:text-4xl">{stat.number}</h3>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-800">
                  {stat.label}
                </p>
              </div>
            ))}

          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-emerald-100 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_42%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(240,253,250,0.98))] px-6 py-12 text-center shadow-[0_30px_70px_rgba(15,23,42,0.12)] sm:px-10 sm:py-16">
            <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
              Ready for better healthcare?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Join thousands of patients and doctors already using Arogyam to
              simplify consultations, coordination, and care delivery.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/register/patient"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-slate-100"
              >
                Get Started as Patient
                <FaArrowRight />
              </Link>

              <Link
                to="/register/doctor"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-400 px-8 py-4 font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-rose-300"
              >
                Join as Doctor
                <FaArrowRight />
              </Link>

              <button className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-4 font-semibold text-gray-700 transition hover:bg-gray-50">
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