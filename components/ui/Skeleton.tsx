"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/[0.04]",
        className,
      )}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="card-elevated p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function StatsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 sm:flex-[2] card-elevated p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      {Array.from({ length: count - 1 }).map((_, i) => (
        <div key={i} className="card-elevated p-3 min-w-[80px] flex-1 space-y-2">
          <Skeleton className="h-5 w-8 mx-auto" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <StatsRowSkeleton />
      <CardSkeleton />
    </div>
  )
}
