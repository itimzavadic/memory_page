import type { Metadata } from "next";
import { Bad_Script, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const memorialScript = Bad_Script({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-memorial-script",
});

export const metadata: Metadata = {
  title: {
    default: "mp_vobraz — Памятные страницы",
    template: "%s | mp_vobraz",
  },
  description:
    "Создание памятных страниц с QR-кодом для установки на памятники.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${memorialScript.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
