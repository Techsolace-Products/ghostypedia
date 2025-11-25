'use client';

import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

function StoriesContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
          <Link href="/dashboard">
            <Button variant="secondary">← Back to Dashboard</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stories Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Browse ghost entities to discover their stories and legends!
          </p>
          <Link href="/ghosts">
            <Button>Browse Ghosts</Button>
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How Stories Work</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Each ghost entity has associated stories and legends</li>
            <li>• Track your reading progress as you explore</li>
            <li>• Mark stories as completed to get better recommendations</li>
            <li>• Stories are linked to specific ghost entities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <ProtectedRoute>
      <StoriesContent />
    </ProtectedRoute>
  );
}
