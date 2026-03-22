"use client"

export default function CategoriesBar({ category, setCategory, vertical }) {

  const categories = [
    { id: "all", label: "🔥 Todo" },
    { id: "carpinteria", label: "🪵 Carpintería" },
    { id: "mecanica", label: "🔧 Mecánica" },
    { id: "rope access", label: "💻 Rope access" },
    { id: "soldadura", label: "💰 Soldadura" },
    { id: "derecho", label: "💰 Derecho" },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">

      <div className={vertical ? "flex flex-col gap-2" : "flex gap-2 overflow-x-auto"}>

        {categories.map((cat) => {

          const isActive = category === cat.id

          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                px-4 py-2 rounded-xl text-sm text-left transition
                ${isActive
                  ? "bg-blue-500 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }
              `}
            >
              {cat.label}
            </button>
          )
        })}

      </div>

    </div>
  )
}