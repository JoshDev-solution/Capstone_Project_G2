"use client";

import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";

const galleryItems = [
  { label: "Happy Dog Visit", emoji: "🐕", color: "#FF4FA3" },
  { label: "Cat Vaccination", emoji: "🐈", color: "#D98CFF" },
  { label: "Surgery Success", emoji: "⚕️", color: "#B84DFF" },
  { label: "Puppy Checkup", emoji: "🐶", color: "#E63590" },
  { label: "Grooming Day", emoji: "✨", color: "#FF4FA3" },
  { label: "Bunny Care", emoji: "🐰", color: "#D98CFF" },
  { label: "Bird Consult", emoji: "🦜", color: "#B84DFF" },
  { label: "Kitten Play", emoji: "🐱", color: "#E63590" },
  { label: "Lab Results", emoji: "🔬", color: "#FF4FA3" },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-accent-200/20 dark:bg-accent-500/5 blur-[100px] -translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3 block">
            Gallery
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Moments of <span className="gradient-text">Joy & Care</span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-lg">
            A glimpse into the loving environment we create for every pet.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ scale: 1.03 }}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                i === 0 || i === 4 ? "lg:col-span-2" : ""
              }`}
              style={{ aspectRatio: i === 0 || i === 4 ? "2/1" : "1/1" }}
            >
              {/* Placeholder gallery card (replace with real images) */}
              <div
                className="w-full h-full flex flex-col items-center justify-center transition-transform group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                  minHeight: "160px",
                }}
              >
                <span className="text-6xl mb-3 drop-shadow-lg">{item.emoji}</span>
                <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                  {item.label}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ background: `${item.color}30` }}
              >
                <div className="glass rounded-xl px-4 py-2">
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              </div>

              {/* Paw watermark */}
              <div className="absolute bottom-3 right-3 opacity-20">
                <PawPrint size={20} style={{ color: item.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
