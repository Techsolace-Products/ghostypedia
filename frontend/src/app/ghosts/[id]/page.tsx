'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ghostsApi, storiesApi, bookmarksApi, type GhostEntity, type Story } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function GhostDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [ghost, setGhost] = useState<GhostEntity | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadGhostDetails(params.id as string);
    }
  }, [params.id]);

  const loadGhostDetails = async (id: string) => {
    try {
      setLoading(true);
      const [ghostData, storiesData] = await Promise.all([
        ghostsApi.getById(id),
        storiesApi.getByGhost(id).catch(() => []),
      ]);
      setGhost(ghostData);
      setStories(storiesData);
    } catch (error) {
      console.error('Failed to load ghost details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!ghost || !isAuthenticated) return;
    
    try {
      await bookmarksApi.create({
        contentId: ghost.id,
        contentType: 'ghost_entity',
        tags: ['favorite'],
      });
      alert('Bookmarked successfully!');
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!ghost) {
    return <div className="min-h-screen flex items-center justify-center">Ghost not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{ghost.name}</h1>
              <p className="text-lg text-gray-600">{ghost.type} • {ghost.origin}</p>
            </div>
            {isAuthenticated && (
              <Button onClick={handleBookmark} variant="secondary">
                Bookmark
              </Button>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700">{ghost.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Characteristics</h2>
            <div className="flex flex-wrap gap-2">
              {ghost.characteristics.map((char, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {char}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Cultural Context</dt>
                <dd className="text-gray-900">{ghost.culturalContext}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Danger Level</dt>
                <dd className="text-gray-900">{ghost.dangerLevel} / 5</dd>
              </div>
            </dl>
          </div>

          {stories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Stories</h2>
              <div className="space-y-4">
                {stories.map((story) => (
                  <div key={story.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">{story.title}</h3>
                    <p className="text-sm text-gray-600">{story.estimatedReadingTime} min read</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
