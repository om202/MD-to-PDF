import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MD to PDF - Free Online Markdown to PDF Converter",
  description: "Convert markdown to professional PDFs instantly. Free online tool with live preview, multiple page sizes (A4, Letter, Legal), configurable margins, and syntax highlighting. No signup required.",
  keywords: ["markdown to pdf", "convert markdown", "md to pdf", "pdf converter", "markdown editor", "free pdf tool", "online converter"],
  authors: [{ name: "om202" }],
  creator: "om202",
  publisher: "om202",
  metadataBase: new URL('https://om202.github.io'),
  alternates: {
    canonical: '/MD-to-PDF',
  },
  openGraph: {
    title: "MD to PDF - Free Online Markdown to PDF Converter",
    description: "Convert markdown to professional PDFs instantly. Free online tool with live preview, multiple page sizes, and syntax highlighting.",
    url: 'https://om202.github.io/MD-to-PDF',
    siteName: 'MD to PDF Converter',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "MD to PDF - Free Online Markdown to PDF Converter",
    description: "Convert markdown to professional PDFs instantly. Free online tool with live preview and syntax highlighting.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "MD to PDF Converter",
              "description": "Free online Markdown to PDF converter with live preview",
              "url": "https://om202.github.io/MD-to-PDF",
              "applicationCategory": "UtilityApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "operatingSystem": "Any",
              "browserRequirements": "Requires JavaScript"
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
