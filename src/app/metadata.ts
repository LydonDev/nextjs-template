import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Next.js Template",
    template: "%s | Next.js Template",
  },
  description: "Ultra-fast Next.js application optimized for enterprise performance",
  keywords: ["nextjs"],
  authors: [{ name: "Fraser Griffiths" }],
  creator: "Fraser Griffiths",
  publisher: "Fraser Griffiths",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://project.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Next.js Template",
    description: "Ultra-fast Next.js application optimized for enterprise performance",
    url: "https://project.vercel.app",
    siteName: "Next.js Template",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
