import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen transition-colors duration-300 main-bg">
      {children}
      <Toaster position="bottom-right" />
    </div>
  )
}
