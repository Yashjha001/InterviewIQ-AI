import type { Metadata } from "next";

import "./globals.css";

import Navbar from "@/components/Navbar";

import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {

  title: "InterviewIQ AI",

  description: "AI Career Growth Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <html lang="en">

      <body>

        <SessionProviderWrapper>

          <Navbar />

          {children}

        </SessionProviderWrapper>

      </body>

    </html>
  );
}