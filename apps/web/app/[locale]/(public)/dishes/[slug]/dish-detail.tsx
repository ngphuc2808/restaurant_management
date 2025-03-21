'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { DishResType } from '@/schemaValidations/dish.schema'
import { formatCurrency } from '@/lib/utils'

const DishDetail = ({ dish }: { dish: DishResType['data'] | undefined }) => {
  const t = useTranslations('Dishes')
  const tAll = useTranslations('All')

  if (!dish)
    return (
      <div>
        <h1 className="text-2xl font-semibold lg:text-3xl">
          {t('dishDoesNotExist')}
        </h1>
      </div>
    )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold lg:text-3xl">{dish.name}</h1>
      <h2 className="font-semibold">
        {tAll('price', { price: formatCurrency(dish.price) })}
      </h2>
      <Image
        src={dish.image}
        width={500}
        height={500}
        quality={80}
        alt={dish.name}
        className="h-full w-full rounded-md object-cover"
        title={dish.name}
        loading="lazy"
      />
      <p>{dish.description}</p>
    </div>
  )
}

export default DishDetail
