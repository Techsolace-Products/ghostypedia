'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Ghostypedia</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <Button onClick={logout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">User Information</h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div>
                  <dt className="inline font-medium text-gray-700">Email: </dt>
                  <dd className="inline text-gray-600">{user?.email}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-gray-700">Username: </dt>
                  <dd className="inline text-gray-600">{user?.username}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-gray-700">User ID: </dt>
                  <dd className="inline text-gray-600 font-mono text-xs">{user?.id}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-gray-700">Member since: </dt>
                  <dd className="inline text-gray-600">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="pt-4 border-t">
              <p className="text-gray-600">
                🎉 Authentication is working! You're now logged in and can access protected routes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
