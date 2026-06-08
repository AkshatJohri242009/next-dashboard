import dynamic from "next/dynamic"

export const revalidate = 3600

const Client = dynamic(() => import("./DecisionsClient"), {
  ssr: false,
  loading: () => <div className="min-h-screen animate-pulse bg-white/[0.02] rounded-2xl" />,
})

export default function Page() {
  return <Client />
}