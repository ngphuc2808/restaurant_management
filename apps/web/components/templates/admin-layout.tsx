import { cn } from '@repo/ui/lib/utils'
import { SidebarProvider } from '@repo/ui/components/sidebar'
import AppSidebar from '@/components/organisms/app-sidebar'
import Header from '@/components/organisms/header'
import Main from '@/components/organisms/main'

type Props = {
  children: React.ReactNode
}

const AdminLayout = ({ children }: Props) => {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <div
        id="content"
        className={cn(
          'ml-auto w-full max-w-full',
          'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
          'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
          'transition-[width] duration-200 ease-linear',
          'flex h-svh flex-col',
        )}
      >
        <Header />
        <Main className="p-2 sm:p-4">{children}</Main>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout
