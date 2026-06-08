import dynamic from "next/dynamic"

export const revalidate = 3600

const SettingsPageClient = dynamic(() => import("./SettingsPageClient"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-white/[0.03]" />
      <div className="h-12 rounded-2xl bg-white/[0.03]" />
      <div className="h-80 rounded-2xl bg-white/[0.03]" />
      <div className="h-64 rounded-2xl bg-white/[0.03]" />
    </div>
  ),
})

export default function SettingsPage() {
  return <SettingsPageClient />
}
