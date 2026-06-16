"use client";

import { motion } from "framer-motion";
import { PawPrint, Heart, ExternalLink, Mail, Phone } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Services: ["Consultation", "Vaccination", "Deworming", "Surgery", "Grooming", "Laboratory"],
  "Quick Links": ["About Us", "Meet the Team", "Testimonials", "Gallery", "FAQ", "Contact"],
  Account: ["Register", "Sign In", "Book Appointment", "Pet Registration"],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-neutral-950 text-white overflow-hidden">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-500/5 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl -mt-16 mb-20 p-10 gradient-primary shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Ready to give your pet the best care?
              </h3>
              <p className="text-white/80">Book an appointment today — it takes less than 2 minutes.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/register" className="btn bg-white text-primary-600 font-semibold hover:bg-primary-50 shadow-lg">
                Get Started Free
              </Link>
              <Link href="/login" className="btn bg-white/20 text-white hover:bg-white/30">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold leading-tight gradient-text">LJ Veterinary</div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">Clinic</div>
              </div>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-5">
              Compassionate veterinary care powered by modern technology. Keeping your pets healthy and happy.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary-500/30 flex items-center justify-center transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="mailto:info@ljvetclinic.com" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary-500/30 flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="tel:+639123456789" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary-500/30 flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-neutral-300 mb-5">
                {section}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-500">
          <p>
            © {year} LJ Veterinary Clinic. Made with{" "}
            <Heart className="w-4 h-4 inline text-primary-500" /> for every paw.
          </p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
