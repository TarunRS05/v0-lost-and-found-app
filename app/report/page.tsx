"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, AlertCircle, MapPin } from "lucide-react"

const CATEGORIES = ["Phones", "Wallets", "Keys", "Bags", "Laptops", "Books", "Clothing", "Other"]

export default function ReportPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<"lost" | "found">("lost")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Other")
  const [location, setLocation] = useState("")
  const [locationDetails, setLocationDetails] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState<File | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/auth/login")
      } else {
        setUser(data.user)
        setEmail(data.user.email || "")
      }
      setLoading(false)
    }
    checkUser()
  }, [supabase, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ lat: latitude, lng: longitude })
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        },
        (error) => {
          setError(`Geolocation error: ${error.message}`)
        },
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (!title.trim()) {
        throw new Error("Please enter an item name")
      }
      if (!location.trim()) {
        throw new Error("Please enter a location")
      }

      let imageUrl: string | null = null

      // Upload image if provided and status is "found"
      if (image && status === "found") {
        const fileName = `${user.id}/${Date.now()}-${image.name}`
        const { error: uploadError } = await supabase.storage.from("item-images").upload(fileName, image)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from("item-images").getPublicUrl(fileName)
        imageUrl = data?.publicUrl || null
      }

      const { postItem } = await import("@/app/actions/post-item")
      const result = await postItem({
        title,
        description,
        category,
        status,
        location_name: `${location}, ${locationDetails}`.trim(),
        item_date: date,
        contact_phone: phone,
        contact_email: email,
        coordinates,
        imageUrl,
      })

      if (result.error) {
        setError(result.error)
      } else {
        // Wait a moment before redirect
        setTimeout(() => {
          router.push(`/browse?tab=${status}`)
        }, 500)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post item")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation user={null} />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  const statusLabel = status === "lost" ? "Date Lost" : "Date Found"
  const locationLabel = status === "lost" ? "Last Known Location" : "Location Found"

  return (
    <>
      <Navigation user={user} />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-l from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <Card className="shadow-2xl border-blue-200 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
              <CardTitle className="text-3xl gradient-text">Report an Item</CardTitle>
              <CardDescription>Help us find your item or connect lost items with owners</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Status Toggle */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">What happened?</Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStatus("lost")}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                        status === "lost"
                          ? "bg-red-100 text-red-800 border-2 border-red-400 shadow-lg"
                          : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-red-300"
                      }`}
                    >
                      I Lost This Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("found")}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                        status === "found"
                          ? "bg-green-100 text-green-800 border-2 border-green-400 shadow-lg"
                          : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-green-300"
                      }`}
                    >
                      I Found This Item
                    </button>
                  </div>
                </div>

                {/* Item Name */}
                <div className="grid gap-3 animate-in fade-in">
                  <Label htmlFor="title" className="font-semibold">
                    Item Name *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Black Leather Wallet, iPhone 15"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="border-blue-200 transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                  />
                </div>

                {/* Category */}
                <div className="grid gap-3">
                  <Label htmlFor="category" className="font-semibold">
                    Category *
                  </Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-white dark:bg-slate-900 transition-all duration-300 hover:border-blue-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="grid gap-3">
                  <Label htmlFor="description" className="font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the item in detail (color, brand, condition, etc.)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="border-blue-200 transition-all duration-300 hover:border-blue-400"
                  />
                </div>

                {/* Image Upload - only for found items */}
                {status === "found" && (
                  <div className="grid gap-3 animate-in fade-in">
                    <Label htmlFor="image" className="font-semibold">
                      Upload Photo
                    </Label>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-slate-800">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <label htmlFor="image" className="cursor-pointer">
                        <span className="text-sm text-blue-600 font-semibold hover:underline">Click to upload</span>
                        {image && <p className="text-xs text-green-600 mt-1 animate-in fade-in">{image.name}</p>}
                      </label>
                    </div>
                  </div>
                )}

                {/* Location with Map Pin Button */}
                <div className="space-y-3">
                  <Label htmlFor="location" className="font-semibold block">
                    {locationLabel} *
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        id="location"
                        placeholder="City, Street address, or area"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="border-blue-200 transition-all duration-300 hover:border-blue-400"
                      />
                      <Input
                        placeholder="Additional location details"
                        value={locationDetails}
                        onChange={(e) => setLocationDetails(e.target.value)}
                        className="border-blue-200 transition-all duration-300 hover:border-blue-400"
                      />
                      <p className="text-xs text-muted-foreground">
                        e.g., "5th floor benches" or "Corner of Main and 1st"
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleGetLocation}
                      variant="outline"
                      className="self-start mt-6 h-10 px-3 border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all duration-300 bg-transparent"
                      title="Get current location"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                  {coordinates && (
                    <p className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      ✓ Location pinned: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="grid gap-3">
                  <Label htmlFor="date" className="font-semibold">
                    {statusLabel} *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="border-blue-200 transition-all duration-300 hover:border-blue-400"
                  />
                </div>

                {/* Contact Info */}
                <div className="space-y-4 bg-blue-50 dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-slate-700">
                  <Label className="font-semibold block">Contact Information</Label>
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="email" className="text-sm">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-blue-200 transition-all duration-300 hover:border-blue-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border-blue-200 transition-all duration-300 hover:border-blue-400"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    This information will only be visible to logged-in users
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm animate-in fade-in">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Posting..." : "Post Item"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
