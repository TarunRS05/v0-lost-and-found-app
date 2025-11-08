"use client"

import Link from "next/link"
import { MapPin, Calendar } from "lucide-react"
import { format } from "date-fns"

export default function ItemCard({ item }: { item: any }) {
  const statusColor =
    item.status === "lost"
      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
  const statusText = item.status === "lost" ? "LOST" : "FOUND"

  return (
    <Link href={`/item/${item.id}`}>
      <div className="group h-full rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
        <div className="relative w-full h-48 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 overflow-hidden">
          {item.image_url ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-300">
              <div className="text-center">
                <div className="text-3xl mb-2">📦</div>
                <p className="text-sm font-semibold">{item.category}</p>
              </div>
            </div>
          )}
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${statusColor} shadow-lg backdrop-blur-sm`}
          >
            {statusText}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition duration-300">
            {item.title}
          </h3>

          <div className="space-y-2 text-sm text-muted-foreground dark:text-slate-400">
            <div className="flex items-center gap-2 hover:text-foreground transition duration-200">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{item.location_name}</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition duration-200">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{format(new Date(item.item_date), "MMM d, yyyy")}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-primary bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-full inline-block">
              {item.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
