"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, PawPrint, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlo & Buddy",
    pet: "Labrador Retriever",
    text: "LJ Vet Clinic is absolutely amazing! Dr. Lopez saved Buddy's life after he swallowed a toy. The team was calm, professional, and incredibly caring. I can't thank them enough!",
    rating: 5,
    location: "Makati City",
    initials: "CB",
    color: "#FF4FA3",
  },
  {
    name: "Maria & Whiskers",
    pet: "Persian Cat",
    text: "The online booking system is so convenient! And the vaccination reminders via SMS have been a lifesaver. Whiskers is always healthy thanks to the consistent care we get here.",
    rating: 5,
    location: "Quezon City",
    initials: "MW",
    color: "#D98CFF",
  },
  {
    name: "Jose & Tweety",
    pet: "Cockatiel",
    text: "As an exotic bird owner, finding a vet who truly understands avian medicine was challenging. Dr. Reyes is exceptional! He's knowledgeable, gentle, and always thorough.",
    rating: 5,
    location: "Pasig City",
    initials: "JT",
    color: "#B84DFF",
  },
  {
    name: "Ana & Mochi",
    pet: "Shih Tzu",
    text: "The grooming service is top-notch! Mochi always comes out looking beautiful. The groomers are so gentle and patient. The digital records system is also super helpful.",
    rating: 5,
    location: "BGC, Taguig",
    initials: "AM",
    color: "#E63590",
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const t = testimonials[current];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-60" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-200/20 dark:bg-accent-500/5 blur-[100px]" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3 block">
            Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Happy Pets, <span className="gradient-text">Happy Owners</span>
          </h2>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="card p-10 lg:p-14 text-center"
            >
              {/* Quote icon */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                  <Quote className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>

              <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 max-w-3xl mx-auto italic">
                &quot;{t.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}
                >
                  {t.initials}
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{t.name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                    <PawPrint size={12} className="text-primary-400" />
                    <span>{t.pet}</span>
                    <span>•</span>
                    <span>{t.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="btn btn-secondary btn-icon w-11 h-11 rounded-full"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-primary-500 w-7"
                      : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="btn btn-secondary btn-icon w-11 h-11 rounded-full"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
