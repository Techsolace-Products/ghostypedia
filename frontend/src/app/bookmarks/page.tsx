'use client';

import { useState, useEffect } from 'react';
import { bookmarksApi, type Bookmark } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function BookmarksContent() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const data = await bookmarksApi.getAll();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      await bookmarksApi.delete(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      alert('Failed to delete bookmark');
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          <Link href="/dashboard">
            <Button variant="secondary">← Back to Dashboard</Button>
          </Link>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔖</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring ghosts and stories to save your favorites!
            </p>
            <Link href="/ghosts">
              <Button>Browse Ghosts</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {bookmark.contentType.replace('_', ' ')}
                      </span>
                      {bookmark.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 font-mono mb-2">ID: {bookmark.contentId}</p>
                    {bookmark.notes && (
                      <p className="text-gray-700 text-sm">{bookmark.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Saved on {new Date(bookmark.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDelete(bookmark.id)}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <ProtectedRoute>
      <BookmarksContent />
    </ProtectedRoute>
  );
}
