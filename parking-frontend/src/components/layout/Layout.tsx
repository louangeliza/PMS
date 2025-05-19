// src/components/layout/Layout.tsx
import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import {Sidebar} from './Sidebar'
import React from 'react'
interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-grow container mx-auto px-4 py-8 md:ml-64">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}