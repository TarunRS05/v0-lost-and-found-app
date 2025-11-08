"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Search, User, LogOut } from "lucide-react"
import { useState } from "react"

export default function Navigation({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      setLoading(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition duration-300">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline text-blue-600">FindIt</span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium">
            Home
          </Link>
          <Link
            href="/browse?tab=lost"
            className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium"
          >
            Lost Items
          </Link>
          <Link
            href="/browse?tab=found"
            className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium"
          >
            Found Items
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/report">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300"
                >
                  Report Item
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-blue-50 transition-all duration-300 text-gray-700 border-gray-300 bg-transparent"
                >
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                disabled={loading}
                className="hover:bg-red-50 text-gray-700 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-blue-50 transition-all duration-300 text-gray-700 border-gray-300 bg-transparent"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
