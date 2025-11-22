'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">👻 Ghostypedia</h1>
            <div className="flex items-center gap-4">
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-300">Hi, {user?.username}</span>
                  <Link href="/dashboard">
                    <Button variant="primary">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="secondary">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-5xl font-bold">
            Welcome to Ghostypedia
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            An immersive, AI-powered encyclopedia of ghosts, creatures, myths, and paranormal entities.
            Explore the unknown, discover spooky stories, and get personalized recommendations.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="primary" className="text-lg px-8 py-3">
                  Explore Now
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button variant="primary" className="text-lg px-8 py-3">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" className="text-lg px-8 py-3">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Rich Knowledge Base</h3>
              <p className="text-gray-400">
                Explore a comprehensive database of ghosts, myths, and paranormal entities from cultures worldwide.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Twin</h3>
              <p className="text-gray-400">
                Chat with your personalized digital twin for customized recommendations and insights.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">Personalized Content</h3>
              <p className="text-gray-400">
                Get tailored recommendations for movies, stories, and myths based on your interests.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
