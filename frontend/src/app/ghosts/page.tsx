'use client';

import { useState, useEffect } from 'react';
import { ghostsApi, type GhostEntity } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function GhostsPage() {
  const { isAuthenticated } = useAuth();
  const [ghosts, setGhosts] = useState<GhostEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadGhosts();
  }, [page]);

  const loadGhosts = async () => {
    try {
      setLoading(true);
      const response = await ghostsApi.search({ 
        page, 
        limit: 20,
      });
      console.log('Ghost API response:', response);
      // The API returns the data directly, not in a .data property
      if (Array.isArray(response)) {
        setGhosts(response);
        setTotalPages(1); // Since we have data but no pagination info
      } else {
        setGhosts(response.data || []);
        setTotalPages(response.pagination?.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load ghosts:', error);
      setGhosts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ghost Encyclopedia</h1>
          {isAuthenticated && (
            <Link
              href="/ghosts/create"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold flex items-center gap-2 shadow-lg"
            >
              <span className="text-xl">👻</span>
              Create Ghost
            </Link>
          )}
        </div>

        {ghosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👻</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No ghosts found</h2>
            <p className="text-gray-600 mb-6">
              The ghost database is empty. Add some ghost entities to get started!
            </p>
            {isAuthenticated && (
              <Link
                href="/ghosts/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
              >
                <span className="text-xl">👻</span>
                Create Your First Ghost
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ghosts.map((ghost) => (
              <Link
                key={ghost.id}
                href={`/ghosts/${ghost.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{ghost.name}</h2>
                <p className="text-sm text-gray-600 mb-2">{ghost.type} • {ghost.origin}</p>
                <p className="text-gray-700 line-clamp-3">{ghost.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Danger Level: {ghost.dangerLevel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
