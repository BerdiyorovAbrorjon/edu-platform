import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  const colors: Record<number, string> = {
    0: "bg-red-100 text-red-800 border-red-200",
    1: "bg-orange-100 text-orange-800 border-orange-200",
    2: "bg-amber-100 text-amber-800 border-amber-200",
    3: "bg-yellow-100 text-yellow-800 border-yellow-200",
    4: "bg-lime-100 text-lime-800 border-lime-200",
    5: "bg-green-100 text-green-800 border-green-200",
  };
  return colors[Math.max(0, Math.min(5, Math.round(score)))] ?? colors[0];
}
