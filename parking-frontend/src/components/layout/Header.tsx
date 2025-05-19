// src/components/layout/Header.tsx
import { Link } from 'react-router-dom'
import React from 'react'
export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Parking System
          </Link>
          <div className="flex space-x-4">
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/profile" className="hover:underline">
              Profile
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
