"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, PawPrint } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "Team", href: "#team" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "glass-strong shadow-lg py-3"
          : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg"
              >
                <PawPrint className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight gradient-text">
                  LJ Veterinary
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">
                  Clinic
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-neutral-500 hover:text-primary-500 transition-colors rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-500/10"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="btn-icon btn-ghost rounded-full w-9 h-9 flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>

              <Link
                href="/login"
                className="hidden sm:inline-flex btn btn-ghost text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex btn btn-primary text-sm"
              >
                Get Started
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden btn-icon btn-ghost p-2"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--card-bg)] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileOpen(false)} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setMobileOpen(false)}
                    className="sidebar-link text-base py-3"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-3">
                <Link href="/login" className="btn btn-secondary w-full justify-center">
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary w-full justify-center">
                  Get Started
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
