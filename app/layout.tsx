import type { Metadata, Viewport } from "next"
import dynamic from "next/dynamic"
import ClientLayout from "./ClientLayout"
import { SmoothScrollProvider } from "@/components/motion/SmoothScroll"
import "./globals.css"

const AuthProvider = dynamic(() => import("@/components/AuthProvider"), { ssr: false })

export const metadata: Metadata = {
  title: {
    default: "LifeOS",
    template: "%s — LifeOS",
  },
  description: "Your AI-powered Personal Operating System",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.jpg",
    apple: "/app-icon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050506",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
