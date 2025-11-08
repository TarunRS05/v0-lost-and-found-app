import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FindIt - Lost & Found Platform",
  description: "Connect with lost and found items in your community",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
