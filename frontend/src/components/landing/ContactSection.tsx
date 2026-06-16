"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, ExternalLink, Mail, PawPrint } from "lucide-react";

const contactItems = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["Surallah, South Cotabato"],
    color: "#FF4FA3",
  },
  {
    icon: Phone,
    title: "Contact Numbers",
    lines: ["Mobile: +63-909-152-3519"],
    color: "#D98CFF",
  },
  {
    icon: Clock,
    title: "Operating Hours",
    lines: ["Mon–Fri: 8:00 AM – 6:00 PM", "Saturday: 8:00 AM – 6:00 PM", "Sunday: 8:00 AM – 6:00 PM"],
    color: "#B84DFF",
  },
  {
    icon: Mail,
    title: "Email & Social",
    lines: ["eguialovely@gmail.com"],
    color: "#E63590",
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary-100/30 dark:bg-primary-500/5 blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-3 block">
            Contact Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-lg">
            We'd love to hear from you. Visit us, call us, or send a message anytime.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {contactItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card p-6 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${item.color}15` }}
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-base mb-3">{item.title}</h3>
                <div className="flex flex-col gap-1">
                  {item.lines.map((line, j) => (
                    <p key={j} className="text-sm text-neutral-500 dark:text-neutral-400">{line}</p>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Social CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="sm:col-span-2 gradient-primary rounded-2xl p-6 text-white flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-lg mb-1">Follow us on Facebook</p>
                <p className="text-white/80 text-sm">Stay updated with clinic news and pet care tips.</p>
              </div>
              <a
                href="https://facebook.com/ljvetclinic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <ExternalLink className="w-6 h-6 text-white" />
              </a>
            </motion.div>
          </div>

          {/* Google Map Embed */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card overflow-hidden h-[450px]"
          >
            <div className="h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Find Us on Google Maps</h3>
                <p className="text-sm text-neutral-400 mb-5">9QJ2+GF Surallah, South Cotabato</p>
                <a
                  href="https://maps.google.com/maps/search/?api=1&query=9QJ2%2BF%20Surallah,%20South%20Cotabato"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
            {/* Uncomment and add your Google Maps embed URL for production:
            <iframe
              src="https://www.google.com/maps/embed?pb=YOUR_EMBED_URL"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            /> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
