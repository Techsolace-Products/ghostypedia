'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const features = [
    {
      title: '👻 Browse Ghosts',
      description: 'Explore our comprehensive database of ghosts, spirits, and paranormal entities',
      href: '/ghosts',
      color: 'border-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: '🤖 AI Digital Twin',
      description: 'Chat with your personalized AI assistant about ghosts and paranormal topics',
      href: '/twin',
      color: 'border-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '🔖 Bookmarks',
      description: 'Save and organize your favorite ghosts, stories, and content',
      href: '/bookmarks',
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: '✨ Recommendations',
      description: 'Get personalized content recommendations based on your interests',
      href: '/recommendations',
      color: 'border-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      title: '📚 Stories',
      description: 'Read spooky stories and track your reading progress',
      href: '/stories',
      color: 'border-indigo-500',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              👻 Ghostypedia
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Your Profile</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Explore Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${feature.color} hover:shadow-lg transition-shadow`}
              >
                <div className={`inline-block px-3 py-1 rounded-full ${feature.bgColor} mb-3`}>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{feature.description}</p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">∞</div>
            <div className="text-sm text-gray-600 mt-2">Ghost Entities</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">∞</div>
            <div className="text-sm text-gray-600 mt-2">Stories Available</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">✓</div>
            <div className="text-sm text-gray-600 mt-2">AI Twin Ready</div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-xl">✓</span>
            <div>
              <p className="font-semibold text-green-900">All Systems Operational</p>
              <p className="text-sm text-green-700">
                Authentication, Database, Redis, and AI services are running smoothly
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
