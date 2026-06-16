"use client";

import { motion } from "framer-motion";
import { Award, GraduationCap } from "lucide-react";

const team = [
  {
    name: "Dr. Lovely C. Eguia-Mujemulta",
    role: "Senior Veterinarian",
    specialty: "Small Animal Medicine & Surgery",
    experience: "5+ years",
    initials: "LCEM",
    color: "#FF4FA3",
    bio: "Board-certified with expertise in internal medicine, surgery, and dermatology.",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-24 relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-100/30 dark:bg-primary-500/5 blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3 block">
            Meet the Team
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Our <span className="gradient-text">Expert Team</span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            Dedicated professionals who treat every patient with expertise, care, and love.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-6 text-center group"
            >
              {/* Avatar */}
              <div className="relative mx-auto mb-5 w-fit">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-lg group-hover:scale-105 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}99)` }}
                >
                  {member.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              <h3 className="text-lg font-bold mb-1">{member.name}</h3>
              <p className="text-sm font-medium text-primary-500 mb-1">{member.role}</p>

              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 mb-3">
                <GraduationCap size={12} />
                <span>{member.specialty}</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 mb-4">
                <Award size={12} />
                <span>{member.experience} experience</span>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
