"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Navigation from "@/components/navigation"
import ItemCard from "@/components/item-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

const CATEGORIES = ["Phones", "Wallets", "Keys", "Bags", "Laptops", "Books", "Clothing", "Other"]
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
]

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get("tab") || "lost"
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState<"lost" | "found">(initialTab as "lost" | "found")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)
    }
    checkUser()
  }, [supabase])

  useEffect(() => {
    const newTab = (searchParams.get("tab") || "lost") as "lost" | "found"
    setTab(newTab)
  }, [searchParams])

  useEffect(() => {
    fetchItems()
  }, [tab, searchQuery, selectedCategories, sortBy])

  const fetchItems = async () => {
    setLoading(true)
    try {
      let query = supabase.from("items").select("*").eq("status", tab)

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories)
      }

      const { data: allItems, error } = await query

      if (error) throw error

      let filtered = allItems || []

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (item) => item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q),
        )
      }

      // Sort
      if (sortBy === "newest") {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      } else if (sortBy === "oldest") {
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }

      setItems(filtered)
    } catch (err) {
      console.error("Error fetching items:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  const handleTabChange = (newTab: "lost" | "found") => {
    setTab(newTab)
    router.push(`/browse?tab=${newTab}`)
  }

  return (
    <>
      <Navigation user={user} />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-300 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-300 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Header */}
          <div className="mb-8 fade-in">
            <h1 className="text-4xl font-bold gradient-text mb-2">{tab === "lost" ? "Lost Items" : "Found Items"}</h1>
            <p className="text-muted-foreground">
              {tab === "lost" ? "Search for items you've lost" : "Browse items people have found"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-200">
            <button
              onClick={() => handleTabChange("lost")}
              className={`pb-4 px-2 font-semibold transition border-b-2 duration-300 ${
                tab === "lost"
                  ? "text-red-600 border-red-600"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => handleTabChange("found")}
              className={`pb-4 px-2 font-semibold transition border-b-2 duration-300 ${
                tab === "found"
                  ? "text-green-600 border-green-600"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              Found Items
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by item name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 border-slate-200 transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
              />
            </div>

            {/* Filter Toggle and Controls */}
            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-slate-200 hover:bg-blue-50 transition-all duration-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:border-blue-400 transition-all duration-300"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {(selectedCategories.length > 0 || searchQuery) && (
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategories([])
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Category Filters */}
            {showFilters && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 fade-in">
                <p className="font-semibold mb-3 text-sm">Filter by Category</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="fade-in">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">No items found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
