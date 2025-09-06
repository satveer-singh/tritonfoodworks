import { Inter } from 'next/font/google'
import React from "react";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Triton Food Works Masterbook",
  description: "Real-time Excel Dashboard with Two-way Sync",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏢</text></svg>" />
      </head>
      <body className={inter.className} style={{ margin: 0, padding: 0, minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}

