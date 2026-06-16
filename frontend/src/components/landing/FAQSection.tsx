"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What are your clinic hours?",
    a: "We are open Monday to Saturday, 8:00 AM to 6:00 PM, and Sunday 9:00 AM to 3:00 PM. Emergency services are available 24/7 — please call our hotline for after-hours emergencies.",
  },
  {
    q: "How do I book an appointment online?",
    a: "Register on our website, add your pet's profile, then click 'Book Appointment' from your dashboard. Choose your preferred date, time, and service. You'll receive a confirmation notification once approved.",
  },
  {
    q: "What vaccinations does my dog/cat need?",
    a: "Dogs typically need anti-rabies, 5-in-1 (DHPP+L), and kennel cough vaccines. Cats need anti-rabies and 4-in-1 (FVRCP) vaccines. Our vets will customize a vaccination schedule based on your pet's age and health status.",
  },
  {
    q: "How often should I deworm my pet?",
    a: "Puppies and kittens should be dewormed every 2 weeks until 3 months old, then monthly until 6 months. Adult pets should be dewormed every 3–6 months. Our system will send you automatic reminders.",
  },
  {
    q: "Do you offer payment plans for expensive procedures?",
    a: "Yes! We accept GCash, Maya, credit cards, and cash. For major surgeries and treatments, we offer flexible installment options. Contact our clinic for details.",
  },
  {
    q: "Can I view my pet's medical records online?",
    a: "Absolutely. After registering, you can access your pet's complete medical history — consultations, diagnoses, prescriptions, vaccinations, and lab results — anytime through your client dashboard.",
  },
  {
    q: "What should I bring for my first visit?",
    a: "Please bring any previous vaccination records, medical history, and your pet's current medications if any. For puppies and kittens, bring proof of deworming if already done.",
  },
  {
    q: "Do you have emergency services?",
    a: "Yes, we handle emergency cases. Please call our emergency hotline at +63-912-345-6789 to notify us before arriving so we can prepare the team for your pet.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left group hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-colors"
      >
        <span className={`font-semibold text-base pr-4 transition-colors ${open ? "text-primary-500" : ""}`}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            open
              ? "bg-primary-100 dark:bg-primary-500/20 text-primary-500"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent-200/20 dark:bg-accent-500/5 blur-[100px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3 block">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-lg">
            Got questions? We have answers. If you need more help, our chatbot is ready 24/7.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
