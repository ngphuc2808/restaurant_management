import GlobalLayout from '@/components/templates/global-layout'

const Guest = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <GlobalLayout>{children}</GlobalLayout>
}

export default Guest
