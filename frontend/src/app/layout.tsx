import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LJ Veterinary Clinic — Compassionate Care for Every Paw",
    template: "%s | LJ Veterinary Clinic",
  },
  description:
    "Your trusted partner in veterinary healthcare. Online appointment scheduling, medical records management, vaccinations, treatments, and pet wellness.",
  keywords: [
    "veterinary clinic",
    "pet care",
    "animal hospital",
    "vaccination",
    "pet grooming",
    "veterinarian",
    "LJ Vet Clinic",
  ],
  openGraph: {
    title: "LJ Veterinary Clinic",
    description: "Compassionate Care for Every Paw",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
