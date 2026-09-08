import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "عندي — لوحة الإدارة",
  description: "Admin dashboard for the andi rental marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
