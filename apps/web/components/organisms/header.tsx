import { Separator } from '@repo/ui/components/separator'
import { SidebarTrigger } from '@repo/ui/components/sidebar'
import SwitchLanguage from '@/components/atoms/switch-language'
import DarkModeToggle from '@/components/atoms/switch-mode'
import DropdownAvatar from '@/components/atoms/dropdown-avatar'

const Header = () => {
  return (
    <header
      className={
        'flex h-16 w-full items-center gap-3 bg-background p-4 shadow sm:gap-4'
      }
    >
      <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
      <Separator orientation="vertical" className="h-6" />
      <div className="ml-auto flex items-center space-x-4">
        <SwitchLanguage />
        <DarkModeToggle />
        <DropdownAvatar />
      </div>
    </header>
  )
}

export default Header
