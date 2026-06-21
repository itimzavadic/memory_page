import type { Metadata } from "next";
import { Great_Vibes, Inter, Vollkorn_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const memorialScript = Great_Vibes({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-memorial-script",
});

const memorialName = Vollkorn_SC({
  weight: ["700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-memorial-name",
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
      <body className={`${inter.variable} ${memorialScript.variable} ${memorialName.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
