"use client";

import { motion } from "framer-motion";
import { PawPrint, ArrowRight, CalendarCheck } from "lucide-react";
import Link from "next/link";

const pawPositions = [
  { x: "5%", y: "15%", size: 24, rotation: -30, delay: 0 },
  { x: "15%", y: "75%", size: 20, rotation: 15, delay: 1 },
  { x: "92%", y: "45%", size: 28, rotation: -15, delay: 2 },
  { x: "70%", y: "10%", size: 18, rotation: 45, delay: 0.5 },
  { x: "45%", y: "85%", size: 22, rotation: -45, delay: 1.5 },
  { x: "88%", y: "80%", size: 16, rotation: 20, delay: 2.5 },
  { x: "25%", y: "45%", size: 14, rotation: -60, delay: 3 },
  { x: "60%", y: "30%", size: 16, rotation: 30, delay: 3.5 },
];

export default function HeroSection() {
  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 15, 20, 0.7), rgba(15, 15, 20, 0.9)), url('/images/clinic-front.png')",
        backgroundSize: "cover",
        backgroundPosition: "center 25%",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary-200/20 dark:bg-primary-500/5 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent-200/20 dark:bg-accent-500/5 blur-[100px] translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-primary-100/30 dark:bg-primary-500/3 blur-[80px] -translate-x-1/2 -translate-y-1/2" />

      {/* Animated Paw Prints */}
      {pawPositions.map((paw, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ delay: paw.delay, duration: 1, ease: "easeOut" }}
          className="absolute pointer-events-none"
          style={{ left: paw.x, top: paw.y }}
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [paw.rotation, paw.rotation + 5, paw.rotation] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            <PawPrint
              size={paw.size}
              className="text-primary-400 dark:text-primary-300"
              style={{ transform: `rotate(${paw.rotation}deg)` }}
            />
          </motion.div>
        </motion.div>
      ))}



      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <PawPrint size={14} className="text-primary-500" />
            <span className="text-xs font-semibold text-primary-300 uppercase tracking-wider">
              Trusted Pet Healthcare
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 text-white"
          >
            Compassionate Care{" "}
            <br className="hidden sm:block" />
            for Every{" "}
            <span className="gradient-text">Paw</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg sm:text-xl text-neutral-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Your trusted partner in veterinary healthcare — appointments, vaccinations,
            treatments, and complete pet wellness, all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="btn bg-primary-500 hover:bg-primary-600 text-white border-transparent btn-lg group shadow-[0_0_20px_rgba(255,79,163,0.3)]">
              <CalendarCheck className="w-5 h-5" />
              Book Appointment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md btn-lg shadow-lg">
              <PawPrint className="w-5 h-5" />
              Register Your Pet
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "5,000+", label: "Happy Pets" },
              { value: "15+", label: "Years Experience" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-neutral-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-16 sm:h-24">
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z"
            className="fill-[var(--background)]"
          />
        </svg>
      </div>
    </section>
  );
}
