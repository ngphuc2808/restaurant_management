'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import { DashboardIndicatorResType } from '@/schemaValidations/indicator.schema'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/ui/components/chart'

const colors = [
  'var(--color-chrome)',
  'var(--color-safari)',
  'var(--color-firefox)',
  'var(--color-edge)',
  'var(--color-other)',
]

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))',
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))',
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-3))',
  },
  edge: {
    label: 'Edge',
    color: 'hsl(var(--chart-4))',
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig

const DishBarChart = ({
  chartData,
}: {
  chartData: Pick<
    DashboardIndicatorResType['data']['dishIndicator'][0],
    'name' | 'successOrders'
  >[]
}) => {
  const t = useTranslations('Dashboard')

  const chartDateColors = useMemo(
    () =>
      chartData.map((data, index) => {
        return {
          ...data,
          fill: colors[index] ?? colors[colors.length - 1],
        }
      }),
    [chartData],
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('rankingDishes')}</CardTitle>
        <CardDescription>{t('theMostCalledDish')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartDateColors} layout="vertical">
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <XAxis dataKey="successOrders" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="successOrders"
              name={`${t('orderPaid')}: `}
              layout="vertical"
              radius={5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default DishBarChart
