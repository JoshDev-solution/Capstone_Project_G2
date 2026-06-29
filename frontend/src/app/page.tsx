export const dynamic = "force-dynamic";

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ServicesSection from "@/components/landing/ServicesSection";
import WhyChooseUsSection from "@/components/landing/WhyChooseUsSection";
import TeamSection from "@/components/landing/TeamSection";
import GallerySection from "@/components/landing/GallerySection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

async function getClinicSettings() {
  try {
    let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
    if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
    
    // Use no-store so the landing page gets the latest settings on refresh
    const res = await fetch(`${baseUrl}/api/settings`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch clinic settings", err);
  }
  
  // Return fallback defaults if API fails
  return {
    clinicName: "LJ Veterinary Clinic",
    contactNumber: "+63-909-152-3519",
    emailAddress: "eguialovely@gmail.com",
    websiteUrl: "https://ljvetclinic.com",
    address: "Surallah, South Cotabato",
    monFriOpen: "08:00",
    monFriClose: "18:00",
    weekendClose: "18:00",
    description: "LJ Veterinary Clinic provides compassionate and professional veterinary care for all pets in Surallah, South Cotabato.",
    yearsExperience: "7",
  };
}

export default async function LandingPage() {
  const clinicInfo = await getClinicSettings();

  return (
    <main className="flex flex-col">
      <Navbar clinicInfo={clinicInfo} />
      <HeroSection clinicInfo={clinicInfo} />
      <AboutSection clinicInfo={clinicInfo} />
      <ServicesSection />
      <WhyChooseUsSection />
      <TeamSection />
      <GallerySection />
      <FAQSection clinicInfo={clinicInfo} />
      <ContactSection clinicInfo={clinicInfo} />
      <Footer clinicInfo={clinicInfo} />
    </main>
  );
}
