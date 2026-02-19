import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AgeVerification } from "@/components/AgeVerification";
import { Providers } from "@/components/Providers";
import { AdScript } from "@/components/AdScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Video Platform",
  description: "User-generated video platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <AdScript publisherId="ca-pub-XXXXXXXXXXXXXXXX" />
      </head>
      <body className={inter.className}>
        <Providers>
          <AgeVerification />
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
