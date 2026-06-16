"use client";

import { motion } from "framer-motion";
import { Eye, Target, BookOpen } from "lucide-react";

const items = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To provide compassionate, high-quality veterinary care using modern technology and evidence-based medicine, ensuring the health and happiness of every pet that walks through our doors.",
    color: "#FF4FA3",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "To be the most trusted and innovative veterinary clinic in the Philippines, setting the standard for digital-first pet healthcare and client-centered service excellence.",
    color: "#D98CFF",
  },
  {
    icon: BookOpen,
    title: "Our History",
    text: "Founded with a passion for animal welfare, LJ Veterinary Clinic has grown from a small practice into a full-service veterinary hospital. With over 15 years of dedicated service, we continue to evolve with cutting-edge technology.",
    color: "#B84DFF",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary-100/30 dark:bg-primary-500/5 blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3 block">
            About Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Get to Know <span className="gradient-text">LJ Vet Clinic</span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            Dedicated to the well-being of your beloved pets with modern medicine
            and heartfelt compassion.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {items.map((item) => (
            <motion.div key={item.title} variants={cardVariants} className="card p-8 text-center group">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110"
                style={{ background: `${item.color}15` }}
              >
                <item.icon size={28} style={{ color: item.color }} />
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm">
                {item.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
