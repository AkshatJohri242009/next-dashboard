export default function RootLoading() {
  return (
    <div className="flex min-h-screen bg-[#050506]">
      <div className="w-[72px] lg:w-60 border-r border-white/[0.06] flex-shrink-0 hidden md:flex flex-col p-3 gap-2">
        <div className="w-full h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-full h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-full h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-full h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-3/4 h-8 rounded-lg bg-white/5 animate-pulse mt-auto" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-white/[0.06] flex items-center px-4 gap-3">
          <div className="w-6 h-6 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-32 h-4 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="w-48 h-6 rounded bg-white/5 animate-pulse" />
            <div className="w-full h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />
              <div className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
