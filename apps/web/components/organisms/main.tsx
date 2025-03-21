type Props = {
  children: React.ReactNode
  className?: string
}

const Main = ({ children, className }: Props) => {
  return <main className={className}>{children}</main>
}

export default Main
