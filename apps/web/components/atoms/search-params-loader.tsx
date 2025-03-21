'use client'

import { type ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { Suspense, memo, useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'

type SearchParamsLoaderProps = {
  onParamsReceived: (params: ReadonlyURLSearchParams) => void
}

function Suspender(props: SearchParamsLoaderProps) {
  return (
    <Suspense
      fallback={<LoaderCircle size={28} className="m-auto animate-spin" />}
    >
      <Suspendend {...props} />
    </Suspense>
  )
}

function Suspendend({ onParamsReceived }: SearchParamsLoaderProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    onParamsReceived(searchParams)
  })

  return null
}

const SearchParamsLoader = memo(Suspender)
export default SearchParamsLoader

export const useSearchParamsLoader = () => {
  const [searchParams, setSearchParams] =
    useState<ReadonlyURLSearchParams | null>(null)

  return {
    searchParams,
    setSearchParams,
  }
}
