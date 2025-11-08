"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, MapPin, Calendar, Phone, Mail, AlertCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import ContactModal from "@/components/contact-modal"

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setUser(userData?.user || null)

      const { data: itemData, error } = await supabase.from("items").select("*").eq("id", params.id).single()

      if (error) {
        router.push("/browse")
      } else {
        setItem(itemData)
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase, params.id, router])

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

  if (!item) {
    return (
      <>
        <Navigation user={user} />
        <div className="min-h-screen flex items-center justify-center">
          <p>Item not found</p>
        </div>
      </>
    )
  }

  const statusColor = item.status === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
  const statusText = item.status === "lost" ? "LOST" : "FOUND"
  const canViewContact = user !== null

  return (
    <>
      <Navigation user={user} />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/browse" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Results
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image */}
            <div className="md:col-span-2">
              <Card className="overflow-hidden border-blue-100">
                <div className="w-full h-96 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-2">📦</div>
                      <p>{item.category}</p>
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg text-sm font-bold ${statusColor}`}>
                    {statusText}
                  </div>
                </div>
              </Card>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <Card className="p-6 border-blue-100">
                <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Category</p>
                    <p className="font-semibold text-primary">{item.category}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{item.location_name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{format(new Date(item.item_date), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </Card>

              {/* Contact Info & Action */}
              {canViewContact ? (
                <>
                  <Card className="p-6 border-green-200 bg-green-50">
                    <p className="text-sm font-semibold mb-4 text-green-900">Contact Information</p>
                    <div className="space-y-3">
                      {item.contact_email && (
                        <a
                          href={`mailto:${item.contact_email}`}
                          className="flex items-center gap-2 text-sm hover:text-primary"
                        >
                          <Mail className="w-4 h-4 text-green-600" />
                          {item.contact_email}
                        </a>
                      )}
                      {item.contact_phone && (
                        <a
                          href={`tel:${item.contact_phone}`}
                          className="flex items-center gap-2 text-sm hover:text-primary"
                        >
                          <Phone className="w-4 h-4 text-green-600" />
                          {item.contact_phone}
                        </a>
                      )}
                    </div>
                  </Card>

                  <Button
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </Button>
                </>
              ) : (
                <Card className="p-6 border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-2">Sign in to contact</p>
                      <p className="text-xs text-blue-800 mb-3">
                        Contact information is only visible to logged-in users.
                      </p>
                      <Link href="/auth/login">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          Login
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <Card className="mt-6 p-6 border-blue-100">
              <h2 className="text-lg font-bold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </Card>
          )}
        </div>
      </div>

      {user && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          recipientEmail={item.contact_email}
          recipientId={item.user_id}
          itemTitle={item.title}
          itemId={item.id}
          senderEmail={user.email}
          senderId={user.id}
        />
      )}
    </>
  )
}
