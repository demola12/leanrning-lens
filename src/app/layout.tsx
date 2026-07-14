import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import Script from "next/script";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "LearnLens — AI-Powered Personalized Learning",
  description:
    "Teachers create assignments in minutes. Students receive AI-powered feedback, discover strengths and weaknesses, and get personalized study plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive-static.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive-fonts.css" />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        <Script
          src="https://cdn.jsdelivr.net/npm/mathlive@0.104.0/dist/mathlive.min.js"
          strategy="beforeInteractive"
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
