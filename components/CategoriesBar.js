"use client"

import { useState } from "react"

export default function CategoriesBar({ category, setCategory }) {
  const [collapsed, setCollapsed] = useState(false)

  const categories = [
    { label: "Todo", value: "all", icon: "🔥" },
    { label: "Carpintería", value: "carpinteria", icon: "🪵" },
    { label: "Mecánica", value: "mecanica", icon: "🔧" },
    { label: "Rope access", value: "rope", icon: "🧗" },
    { label: "Soldadura", value: "soldadura", icon: "🔥" },
    { label: "Derecho", value: "derecho", icon: "⚖️" },
  ]

  return (
    <div
      className={`bg-white/80 backdrop-blur-xl border border-gray-200 shadow-sm rounded-3xl p-3 space-y-1 transition-all duration-300
      ${collapsed ? "w-20" : "w-56"}
      `}
    >

      {/* HEADER */}
      <div className="flex items-center justify-between px-2 pb-2">

        {!collapsed && (
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Categorías
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
        >
          ☰
        </button>
      </div>

      {/* LIST */}
      {categories.map((cat) => {
        const isActive = category === cat.value

        return (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group
            
            ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }
            `}
          >
            {/* ACTIVE INDICATOR */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-300
                ${isActive ? "bg-blue-500 opacity-100" : "opacity-0"}
              `}
            />

            {/* ICON */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                }
              `}
            >
              <span>{cat.icon}</span>
            </div>

            {/* LABEL */}
            {!collapsed && (
              <span className="flex-1 text-left">{cat.label}</span>
            )}

            {/* TOOLTIP */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 text-xs bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                {cat.label}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}