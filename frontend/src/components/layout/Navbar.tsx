'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              👻 Ghostypedia
            </Link>
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <Link href="/ghosts" className="text-sm text-gray-600 hover:text-gray-900">
                  Browse Ghosts
                </Link>
                <Link href="/twin" className="text-sm text-gray-600 hover:text-gray-900">
                  AI Twin
                </Link>
                <Link href="/bookmarks" className="text-sm text-gray-600 hover:text-gray-900">
                  Bookmarks
                </Link>
                <Link href="/preferences" className="text-sm text-gray-600 hover:text-gray-900">
                  Preferences
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  Hi, {user?.username}
                </Link>
                <Button onClick={handleLogout} variant="secondary" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
