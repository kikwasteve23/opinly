import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function compactMoney(amount: number) {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2).replace(/\.00$/, "").replace(/0$/, "")}K`;
  }
  return money(amount);
}
