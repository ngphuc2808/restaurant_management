import GlobalLayout from '@/components/templates/global-layout'

const Public = async ({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) => {
  return (
    <GlobalLayout>
      {children}
      {modal}
    </GlobalLayout>
  )
}

export default Public
