import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Opinly: Get paid for an honest take",
  description: "Join paid online studies with Opinly. Studies run inside the platform, you are paid in crypto, and joining is always free.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${figtree.variable} scroll-smooth`}>
      <body className="min-h-full bg-white font-sans text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
