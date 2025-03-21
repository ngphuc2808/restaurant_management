import { Minus, Plus } from 'lucide-react'

import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'

const Quantity = ({
  onChange,
  value,
}: {
  onChange: (value: number) => void
  value: number
}) => {
  return (
    <div className="flex gap-1 ">
      <Button
        className="h-6 w-6 p-0"
        disabled={value === 0}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="h-6 w-8 p-1 text-center"
        value={value}
        onChange={(e) => {
          let value = e.target.value
          const numberValue = Number(value)
          if (isNaN(numberValue)) {
            return
          }
          onChange(numberValue)
        }}
      />
      <Button className="h-6 w-6 p-0" onClick={() => onChange(value + 1)}>
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}

export default Quantity
