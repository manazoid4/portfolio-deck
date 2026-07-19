import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manazir Hussain — System Architect, Founder, AI Engineer",
  description:
    "Portfolio of Manazir Hussain (@manazoid4): AI-native products, agent environments, and live shipping activity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
