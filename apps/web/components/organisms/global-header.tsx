import Image from 'next/image'
import { PanelLeft } from 'lucide-react'

import { Link } from '@/i18n/routing'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components/sheet'
import { Button } from '@repo/ui/components/button'
import NavItems from '@/components/molecules/nav-items'
import SwitchLanguage from '@/components/atoms/switch-language'
import DarkModeToggle from '@/components/atoms/switch-mode'

const GlobalHeader = () => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Image
            src="/logo.png"
            width={60}
            height={60}
            quality={80}
            loading="lazy"
            alt="Logo"
            title="Logo"
          />
        </Link>
        <NavItems className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground" />
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label="toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle />
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Image
                src="/logo.png"
                width={60}
                height={60}
                quality={80}
                loading="lazy"
                alt="Logo"
                title="Logo"
              />
            </Link>
            <NavItems className="text-muted-foreground transition-colors hover:text-foreground" />
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-auto flex items-center space-x-4">
        <SwitchLanguage />
        <DarkModeToggle />
      </div>
    </header>
  )
}

export default GlobalHeader
