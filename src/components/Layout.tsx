import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen transition-colors duration-300 main-bg">
      {children}
    </div>
  )
}
