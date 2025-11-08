"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { X, Send, AlertCircle } from "lucide-react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  recipientEmail: string
  recipientId: string
  itemTitle: string
  itemId: string
  senderEmail: string
  senderId: string
}

export default function ContactModal({
  isOpen,
  onClose,
  recipientEmail,
  recipientId,
  itemTitle,
  itemId,
  senderEmail,
  senderId,
}: ContactModalProps) {
  const [senderName, setSenderName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!senderName.trim()) {
        throw new Error("Please enter your name")
      }
      if (!message.trim()) {
        throw new Error("Please enter your message")
      }

      const response = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          senderEmail,
          senderId,
          senderName,
          message,
          recipientEmail,
          recipientId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send inquiry")
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSenderName("")
        setMessage("")
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send inquiry")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl border-blue-100">
        <div className="flex items-center justify-between p-6 border-b border-blue-100">
          <h2 className="text-xl font-bold text-gray-900">Inquire About Item</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-green-600 font-semibold">Inquiry sent successfully!</p>
              <p className="text-sm text-gray-600 mt-2">The item owner will receive your message.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Item:</span> {itemTitle}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Message will be sent to: <span className="font-semibold">{recipientEmail}</span>
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name" className="font-semibold text-gray-900">
                  Your Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  className="border-blue-200"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message" className="font-semibold text-gray-900">
                  Your Message *
                </Label>
                <Textarea
                  id="message"
                  placeholder="Ask about the item, provide information, or express interest..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                  className="border-blue-200"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}
