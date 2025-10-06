import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "LinkedIn Post Generator | Logic Joe",
  description: "Erstelle inspirierende LinkedIn-Posts direkt vom Event-Kiosk.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="lj-header">
          <div className="lj-header-inner">
            <Link href="/">
              <Image
                src="/logic-joe.svg"
                alt="Logic Joe"
                width={100}
                height={100}
                className="lj-header-logo lj-header-lj"
              />
            </Link>
            <Image
              src="/ibexa.svg"
              alt="Ibexa"
              width={110}
              height={52}
              className="lj-header-logo lj-header-ibexa"
            />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
