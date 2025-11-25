'use client';

import { useState, useEffect } from 'react';
import { recommendationsApi, type Recommendation } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function RecommendationsContent() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await recommendationsApi.get(20);
      setRecommendations(data.recommendations);
      setMessage(data.message || '');
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
      setMessage('Unable to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (recommendationId: string, feedbackType: 'like' | 'dislike' | 'not_interested') => {
    try {
      await recommendationsApi.submitFeedback(recommendationId, feedbackType);
      // Remove from list after feedback
      setRecommendations(recommendations.filter(r => r.id !== recommendationId));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Personalized Recommendations</h1>
          <Link href="/dashboard">
            <Button variant="secondary">← Back to Dashboard</Button>
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No recommendations yet</h2>
            <p className="text-gray-600 mb-6">
              {message || 'Explore more content to get personalized recommendations!'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/ghosts">
                <Button>Browse Ghosts</Button>
              </Link>
              <Link href="/stories">
                <Button variant="secondary">Read Stories</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {rec.contentType.replace('_', ' ')}
                      </span>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        {Math.round(rec.score * 100)}% match
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{rec.reasoning}</p>
                    <p className="text-xs text-gray-500">
                      Generated {new Date(rec.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleFeedback(rec.id, 'like')}
                    variant="primary"
                    size="sm"
                  >
                    👍 Like
                  </Button>
                  <Button
                    onClick={() => handleFeedback(rec.id, 'dislike')}
                    variant="secondary"
                    size="sm"
                  >
                    👎 Dislike
                  </Button>
                  <Button
                    onClick={() => handleFeedback(rec.id, 'not_interested')}
                    variant="secondary"
                    size="sm"
                  >
                    Not Interested
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

export default function RecommendationsPage() {
  return (
    <ProtectedRoute>
      <RecommendationsContent />
    </ProtectedRoute>
  );
}
