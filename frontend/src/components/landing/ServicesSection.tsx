"use client";

import { motion } from "framer-motion";
import {
  Stethoscope, Syringe, Bug, Scissors, Sparkles,
  FlaskConical, ShoppingBag, Pill,
} from "lucide-react";

const services = [
  { icon: Stethoscope, name: "Consultation", desc: "Complete physical examinations, health assessments, and expert medical advice for your pets.", color: "#FF4FA3" },
  { icon: Syringe, name: "Vaccination", desc: "Full vaccination programs including anti-rabies, 5-in-1, and 4-in-1 to keep your pets protected.", color: "#E63590" },
  { icon: Bug, name: "Deworming", desc: "Internal and external parasite treatment and prevention plans for healthy, happy pets.", color: "#D98CFF" },
  { icon: Scissors, name: "Surgery", desc: "Minor and major surgical procedures performed with care by experienced veterinary surgeons.", color: "#B84DFF" },
  { icon: Sparkles, name: "Grooming", desc: "Professional bathing, haircuts, nail trimming, and ear cleaning to keep your pets looking great.", color: "#9B30E6" },
  { icon: FlaskConical, name: "Laboratory", desc: "Complete blood work, urinalysis, X-rays, and diagnostic testing for accurate results.", color: "#7E1FCC" },
  { icon: ShoppingBag, name: "Pet Supplies", desc: "Premium pet food, accessories, hygiene products, and everything your pet needs.", color: "#FF4FA3" },
  { icon: Pill, name: "Medicines", desc: "Prescription and over-the-counter medications, supplements, and vitamins available.", color: "#E63590" },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent-200/20 dark:bg-accent-500/5 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3 block">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Complete <span className="gradient-text">Pet Care</span> Solutions
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            From routine checkups to specialized treatments, we offer comprehensive
            veterinary services for your furry family members.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card p-6 group cursor-pointer"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 group-hover:shadow-lg"
                style={{ background: `${service.color}12` }}
              >
                <service.icon size={26} style={{ color: service.color }} />
              </div>
              <h3 className="text-lg font-bold mb-2">{service.name}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {service.desc}
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
