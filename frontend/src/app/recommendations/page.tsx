'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, ThumbsUp, ThumbsDown, X, Ghost, BookOpen, RefreshCw } from 'lucide-react';
import { recommendationsApi, type Recommendation } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

const SectionHeader = ({ title, sub }: { title: string; sub: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-12 border-l-4 border-white/20 pl-6">
      <motion.h1
        initial={{ x: -20, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        className="text-5xl md:text-7xl font-['Oswald'] font-bold uppercase tracking-tighter text-white"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ x: -20, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
        className="font-mono text-gray-400 mt-2 tracking-widest text-sm"
      >
        // {sub}
      </motion.p>
    </div>
  );
};

const MatchScore = ({ score }: { score: number }) => {
  const percentage = Math.round(score * 100);
  const getColor = () => {
    if (percentage >= 80) return 'text-green-500 border-green-500/30 bg-green-900/20';
    if (percentage >= 60) return 'text-yellow-500 border-yellow-500/30 bg-yellow-900/20';
    return 'text-red-500 border-red-500/30 bg-red-900/20';
  };
  
  return (
    <div className={`px-3 py-1 border font-mono text-sm tracking-wider ${getColor()}`}>
      {percentage}% MATCH
    </div>
  );
};

function RecommendationsContent() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const data = await recommendationsApi.get(20);
      setRecommendations(data.recommendations);
      setMessage(data.message || '');
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
      setMessage('Unable to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFeedback = async (recommendationId: string, feedbackType: 'like' | 'dislike' | 'not_interested') => {
    try {
      await recommendationsApi.submitFeedback(recommendationId, feedbackType);
      setRecommendations(recommendations.filter(r => r.id !== recommendationId));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const getContentIcon = (contentType: string) => {
    if (contentType === 'ghost_entity') return Ghost;
    if (contentType === 'story') return BookOpen;
    return Sparkles;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="relative">
          <Sparkles size={48} className="text-white/20 animate-pulse" />
          <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
        </div>
        <p className="font-mono text-sm text-gray-500 mt-6 tracking-widest animate-pulse">
          ANALYZING_PREFERENCES...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;400;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
      `}</style>

      {/* Cinematic Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[50]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.02]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-[0.1]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,#000000_100%)] opacity-60" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm tracking-widest mb-8 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          RETURN_TO_HQ
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeader title="For You" sub="AI_CURATED_RECOMMENDATIONS" />
          
          <button
            onClick={() => loadRecommendations(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 border border-white/20 bg-white/5 font-mono text-sm tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 self-start"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'REFRESHING...' : 'REFRESH'}
          </button>
        </div>

        {recommendations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 bg-white/5 p-12 text-center"
          >
            <div className="relative inline-block mb-6">
              <Sparkles size={64} className="text-white/20" />
              <div className="absolute inset-0 bg-red-500/10 blur-2xl" />
            </div>
            <h2 className="text-2xl font-['Oswald'] uppercase tracking-wider mb-2">No Recommendations</h2>
            <p className="font-mono text-sm text-gray-500 tracking-wider mb-8 max-w-md mx-auto">
              {message || '// EXPLORE_MORE_CONTENT_TO_TRAIN_AI'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/ghosts"
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-mono tracking-widest hover:bg-gray-200 transition-all"
              >
                <Ghost size={16} />
                BROWSE_ENTITIES
              </Link>
              <Link
                href="/preferences"
                className="flex items-center gap-2 px-6 py-3 border border-white/20 bg-white/5 font-mono tracking-widest hover:bg-white/10 transition-all"
              >
                UPDATE_PREFERENCES
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {recommendations.map((rec, index) => {
                const Icon = getContentIcon(rec.contentType);
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-white/10 bg-black/30 hover:border-white/20 transition-all"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 border border-white/10">
                            <Icon size={20} className="text-red-500" />
                          </div>
                          <div>
                            <span className="px-2 py-0.5 bg-red-900/30 border border-red-500/30 text-[10px] font-mono text-red-400 uppercase tracking-widest">
                              {rec.contentType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <MatchScore score={rec.score} />
                      </div>

                      <p className="font-['Rajdhani'] text-lg text-gray-300 leading-relaxed mb-4">
                        {rec.reasoning}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="font-mono text-[10px] text-gray-600 tracking-widest">
                          GENERATED: {new Date(rec.generatedAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFeedback(rec.id, 'like')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-500/30 text-green-400 font-mono text-xs tracking-widest hover:bg-green-900/40 transition-all"
                          >
                            <ThumbsUp size={14} />
                            LIKE
                          </button>
                          <button
                            onClick={() => handleFeedback(rec.id, 'dislike')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-400 font-mono text-xs tracking-widest hover:bg-white/10 transition-all"
                          >
                            <ThumbsDown size={14} />
                          </button>
                          <button
                            onClick={() => handleFeedback(rec.id, 'not_interested')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-400 font-mono text-xs tracking-widest hover:bg-white/10 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-8 font-mono text-xs text-gray-600 tracking-widest">
            <span>RECOMMENDATIONS: <span className="text-white">{recommendations.length}</span></span>
            <span>AI_MODEL: <span className="text-red-400">GEMINI</span></span>
            <span>STATUS: <span className="text-green-500">ACTIVE</span></span>
          </div>
        </div>
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
