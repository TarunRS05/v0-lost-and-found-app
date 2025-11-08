"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import ItemCard from "@/components/item-card"
import { Search } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)

      // Fetch recent found items
      const { data: items } = await supabase
        .from("items")
        .select("*")
        .eq("status", "found")
        .order("created_at", { ascending: false })
        .limit(8)

      setRecentItems(items || [])
      setLoading(false)
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      checkUser()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  return (
    <main className="min-h-screen">
      <Navigation user={user} />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 slide-up">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              <span className="gradient-text">Reuniting you with your belongings</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Report a lost item or post one you've found. Our community is here to help you reconnect with what
              matters.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 fade-in">
            <Button
              size="lg"
              onClick={() => router.push("/browse?tab=lost")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg"
            >
              <Search className="w-5 h-5 mr-2" />I Lost Something
            </Button>
            <Button
              size="lg"
              onClick={() => router.push("/browse?tab=found")}
              variant="outline"
              className="border-2 px-8 py-6 text-lg hover:bg-accent hover:text-accent-foreground"
            >
              <Search className="w-5 h-5 mr-2" />I Found Something
            </Button>
          </div>

          {/* Secondary CTA */}
          {user ? (
            <Link href="/report">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
              >
                Report an Item Now
              </Button>
            </Link>
          ) : (
            <p className="text-gray-700 font-medium">
              <Link href="/auth/sign-up" className="text-blue-600 font-semibold hover:text-blue-700 underline">
                Create an account
              </Link>{" "}
              to post an item
            </p>
          )}
        </div>
      </section>

      {/* Recently Found Items Feed */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Recently Found</h2>
            <p className="text-gray-600 font-medium">Items posted by our community recently</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p>No items found yet. Be the first to post!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 border border-blue-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Can't find what you're looking for?</h2>
          <p className="text-gray-700 font-medium mb-6">Post your lost item and our community will help you find it.</p>
          {user ? (
            <Link href="/report">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Report Lost Item</Button>
            </Link>
          ) : (
            <Link href="/auth/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up to Post</Button>
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}
