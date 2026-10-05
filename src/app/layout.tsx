import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deep Research | بحث عميق",
  description: "أداة بحث عميق متعددة الخطوات مشابهة لـ Gemini Deep Research. Multi-step deep research tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
