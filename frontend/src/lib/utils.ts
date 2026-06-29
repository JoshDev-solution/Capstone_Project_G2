import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function generateCode(prefix: string, id: number): string {
  return `${prefix}-${String(id).padStart(5, "0")}`;
}

export function calculateAge(dob: string | Date | undefined | null): string {
  if (!dob || dob === "Unknown") return "Unknown Age";
  
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return "Unknown Age";

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return years === 1 ? "1 year old" : `${years} years old`;
  } else if (months > 0) {
    return months === 1 ? "1 month old" : `${months} months old`;
  } else {
    // Calculate weeks/days if under a month
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 7) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week old" : `${weeks} weeks old`;
    }
    return diffDays <= 1 ? "1 day old" : `${diffDays} days old`;
  }
}
