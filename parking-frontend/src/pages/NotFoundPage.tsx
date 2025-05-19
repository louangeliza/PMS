// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { ErrorLayout } from '../components/layout/ErrorLayout';
import React from 'react';
const NotFoundPage = () => {
  return (
    <ErrorLayout title="404 Not Found">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </ErrorLayout>
  );
};

export default NotFoundPage; // This is crucial