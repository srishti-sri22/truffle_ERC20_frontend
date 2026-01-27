import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truffle Token and Faucet",
  description: "A simple token along with its faucet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

