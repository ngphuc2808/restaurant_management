import { Skeleton } from '@repo/ui/components/skeleton'

const TableSkeleton = () => {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <Skeleton className="h-[20px] w-1/4 rounded-md" />
        <Skeleton className="h-[20px] w-1/4 rounded-md" />
        <Skeleton className="h-[20px] w-1/4 rounded-md" />
        <Skeleton className="h-[20px] w-1/4 rounded-md" />
      </div>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="mb-2 flex items-center justify-between">
          <Skeleton className="h-[20px] w-1/4 rounded-md" />
          <Skeleton className="h-[20px] w-1/4 rounded-md" />
          <Skeleton className="h-[20px] w-1/4 rounded-md" />
          <Skeleton className="h-[20px] w-1/4 rounded-md" />
        </div>
      ))}
    </div>
  )
}

export default TableSkeleton
