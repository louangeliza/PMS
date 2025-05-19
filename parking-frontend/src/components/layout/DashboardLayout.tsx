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
  showAddVehicle?: boolean;
}

// src/components/layout/DashboardLayout.tsx
export function DashboardLayout({ 
  children,
  title, // This will be used for the page title
  showAddVehicle = false 
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
              {showAddVehicle && (
                <Link to="/vehicles/add" className="...">
                  Add Vehicle
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