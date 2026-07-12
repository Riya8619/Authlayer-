import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-sans-loaded" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-loaded" })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://authlayer.example'
const title = 'AuthLayer - AI Trust Intelligence'
const description =
  'Trust Nothing. Verify Everything. Enterprise-grade AI forensic intelligence for deepfake detection and content verification.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | AuthLayer',
  },
  description,
  applicationName: 'AuthLayer',
  keywords: [
    'deepfake detection',
    'AI content verification',
    'image forensics',
    'trust score',
    'media authenticity',
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title,
    description,
    siteName: 'AuthLayer',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
