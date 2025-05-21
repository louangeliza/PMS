// src/components/layout/DashboardLayout.tsx
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import {Sidebar} from './Sidebar';
import { Link } from 'react-router-dom';
import React from 'react';
interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  showAddEntry?: boolean;
}

// src/components/layout/DashboardLayout.tsx
export function DashboardLayout({ 
  children,
  title, // This will be used for the page title
  showAddEntry = false 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header /> {/* Only header in the app */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-grow overflow-y-auto md:ml-64">
          <div className="container mx-auto px-4 py-8">
            {/* Page title section - controlled by layout */}
            <div className="mb-6 flex justify-between items-center">
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {showAddEntry && (
                <Link
                  to="/entries/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Add Car Entry
                </Link>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}