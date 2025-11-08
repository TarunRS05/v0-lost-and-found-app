"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ItemCard from "@/components/item-card"
import { LogOut } from "lucide-react"

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [myItems, setMyItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

      if (profileData) {
        setProfile(profileData)
        setPhone(profileData.phone_number || "")
      }

      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })

      setMyItems(itemsData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const handleUpdateProfile = async () => {
    setUpdating(true)
    try {
      const { error } = await supabase.from("profiles").update({ phone_number: phone }).eq("id", user.id)

      if (error) throw error
      alert("Profile updated!")
    } catch (err) {
      alert("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <>
        <Navigation user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation user={user} />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <Card className="mb-8 shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-2xl gradient-text">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold">Email</Label>
                    <p className="mt-2 text-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                      className="mt-2 border-blue-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Items */}
          <Card className="shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-2xl gradient-text">My Posts ({myItems.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {myItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">You haven't posted any items yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
