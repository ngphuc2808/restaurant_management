import Main from '@/components/organisms/main'
import Footer from '@/components/organisms/footer'
import GlobalHeader from '@/components/organisms/global-header'

type Props = {
  children: React.ReactNode
}

const GlobalLayout = ({ children }: Props) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <GlobalHeader />
      <Main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </Main>
      <Footer />
    </div>
  )
}

export default GlobalLayout
