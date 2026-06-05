import { PageSkeleton } from "@/components/ui/Skeleton"

export default function RootLoading() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="w-[72px] lg:w-60 border-r shrink-0 hidden md:flex flex-col p-3 gap-2" style={{ borderColor: "var(--border)" }}>
        <div className="w-full h-8 rounded-lg animate-pulse" style={{ backgroundColor: "color-mix(in srgb, var(--text) 5%, transparent)" }} />
        <div className="w-full h-8 rounded-lg animate-pulse" style={{ backgroundColor: "color-mix(in srgb, var(--text) 5%, transparent)" }} />
        <div className="w-full h-8 rounded-lg animate-pulse" style={{ backgroundColor: "color-mix(in srgb, var(--text) 5%, transparent)" }} />
        <div className="w-full h-8 rounded-lg animate-pulse" style={{ backgroundColor: "color-mix(in srgb, var(--text) 5%, transparent)" }} />
        <div className="w-3/4 h-8 rounded-lg animate-pulse mt-auto" style={{ backgroundColor: "color-mix(in srgb, var(--text) 5%, transparent)" }} />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-4 gap-3" style={{ borderColor: "var(--border)" }}>
          <div className="w-6 h-6 rounded-lg animate-pulse" style={{ backgroundColor: "color-mix(in srgb, var(--text) 5%, transparent)" }} />
          <div className="w-32 h-4 rounded animate-pulse" style={{ backgroundColor: "color-mix(in srgb, var(--text) 5%, transparent)" }} />
        </div>
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PageSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
