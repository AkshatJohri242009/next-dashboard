import dynamic from "next/dynamic"

export const revalidate = 3600

const HomePageClient = dynamic(() => import("./HomePageClient"), {
  ssr: false,
  loading: () => (
    <div className="space-y-8 pb-8 animate-pulse">
      <div className="h-48 rounded-2xl bg-white/[0.03]" />
      <div className="h-32 rounded-2xl bg-white/[0.03]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-white/[0.03]" />
        <div className="h-64 rounded-2xl bg-white/[0.03]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 rounded-2xl bg-white/[0.03]" />
        <div className="h-48 rounded-2xl bg-white/[0.03]" />
      </div>
    </div>
  ),
})

export default function HomePage() {
  return <HomePageClient />
}
