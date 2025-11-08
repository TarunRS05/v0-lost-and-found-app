import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { itemId, senderEmail, senderName, message, recipientEmail, recipientId, senderId } = body

    if (!itemId || !senderEmail || !senderName || !message || !recipientEmail || !recipientId || !senderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { error: dbError } = await supabase.from("inquiries").insert({
      item_id: itemId,
      sender_id: senderId,
      sender_name: senderName,
      sender_email: senderEmail,
      message: message,
      recipient_id: recipientId,
      status: "unread",
    })

    if (dbError) {
      console.error("Database error:", dbError)
      throw new Error("Failed to store inquiry")
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: recipientEmail,
        replyTo: senderEmail,
        subject: `New Inquiry About Your Lost & Found Item`,
        html: `
          <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">New Inquiry About Your Item</h2>
            <p style="color: #333; margin-bottom: 15px;">Hello,</p>
            <p style="color: #333; margin-bottom: 15px;"><strong>${senderName}</strong> (${senderEmail}) is interested in your Lost & Found post.</p>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;"><strong>Their Message:</strong></p>
              <p style="margin: 0; color: #333; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
            </div>
            
            <p style="color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              You can reply directly to them at: <strong style="color: #333;">${senderEmail}</strong>
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated message from FindIt Lost & Found Platform
            </p>
          </div>
        `,
      }),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.json()
      console.error("Resend error:", error)
      // Note: Email sending failed but inquiry was stored successfully, so we still return success
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry sent successfully! The item owner will be notified.",
    })
  } catch (error) {
    console.error("Error sending inquiry:", error)
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 })
  }
}
