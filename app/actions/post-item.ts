"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface PostItemData {
  title: string
  description: string
  category: string
  status: "lost" | "found"
  location_name: string
  item_date: string
  contact_phone: string
  contact_email: string
  coordinates: { lat: number; lng: number } | null
  imageUrl: string | null
}

export async function postItem(data: PostItemData) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "Authentication failed. Please log in again." }
    }

    // Insert item into database
    const { error: insertError, data: insertedItem } = await supabase
      .from("items")
      .insert({
        user_id: user.id,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        status: data.status,
        location_name: data.location_name.trim(),
        item_date: data.item_date,
        image_url: data.imageUrl,
        contact_phone: data.contact_phone.trim(),
        contact_email: data.contact_email.trim(),
        latitude: data.coordinates?.lat || null,
        longitude: data.coordinates?.lng || null,
      })
      .select()

    if (insertError) {
      console.error("Insert error:", insertError)
      return { error: `Failed to post item: ${insertError.message}` }
    }

    return { success: true, message: `Item posted successfully! Redirecting...` }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
    console.error("Error posting item:", errorMessage)
    return { error: errorMessage }
  }
}
