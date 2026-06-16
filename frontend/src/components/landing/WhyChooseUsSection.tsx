"use client";

import { motion } from "framer-motion";
import {
  UserCheck, FileText, CalendarCheck, Bell,
  Heart, Zap,
} from "lucide-react";

const features = [
  { icon: UserCheck, title: "Experienced Veterinarians", desc: "Board-certified vets with 10+ years of experience in small and large animal medicine.", color: "#FF4FA3" },
  { icon: FileText, title: "Digital Medical Records", desc: "Access your pet's complete medical history, prescriptions, and lab results anytime, anywhere.", color: "#D98CFF" },
  { icon: CalendarCheck, title: "Online Booking", desc: "Book appointments 24/7 from any device. No more waiting on hold or visiting in person.", color: "#B84DFF" },
  { icon: Bell, title: "Vaccination Reminders", desc: "Never miss a vaccination or deworming schedule with our automated reminder system.", color: "#FF4FA3" },
  { icon: Heart, title: "Professional Pet Care", desc: "Compassionate and gentle approach to ensure your pet feels safe and comfortable.", color: "#E63590" },
  { icon: Zap, title: "Fast Support", desc: "Quick responses through our chatbot and direct messaging with your assigned veterinarian.", color: "#9B30E6" },
];

export default function WhyChooseUsSection() {
  return (
    <section id="why-us" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[450px] h-[450px] rounded-full bg-primary-200/20 dark:bg-primary-500/5 blur-[100px] translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            The <span className="gradient-text">Smart Choice</span> for Your Pet
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            We combine modern technology with genuine compassion to deliver
            veterinary care that truly makes a difference.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl p-7 glass border border-white/30 dark:border-white/5 hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"
                style={{ background: `radial-gradient(circle at center, ${f.color}, transparent)` }}
              />
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3"
                style={{ background: `${f.color}15` }}
              >
                <f.icon size={26} style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
