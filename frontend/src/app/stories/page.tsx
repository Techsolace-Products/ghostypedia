'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen, Clock, Ghost, Search, ChevronRight } from 'lucide-react';
import { storiesApi, type Story } from '@/lib/api';
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

function StoriesContent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      // Try to load stories - API might not have a getAll method yet
      const data = await storiesApi.getAll?.() || [];
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="relative">
          <BookOpen size={48} className="text-white/20 animate-pulse" />
          <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
        </div>
        <p className="font-mono text-sm text-gray-500 mt-6 tracking-widest animate-pulse">
          LOADING_CASE_FILES...
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12">
        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm tracking-widest mb-8 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          RETURN_TO_HQ
        </Link>

        {/* Header */}
        <SectionHeader title="Case Files" sub="PARANORMAL_INCIDENT_REPORTS" />

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH_CASE_FILES..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 font-mono text-sm tracking-wider placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        {stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 bg-white/5 p-12 text-center"
          >
            <div className="relative inline-block mb-6">
              <BookOpen size={64} className="text-white/20" />
              <div className="absolute inset-0 bg-red-500/10 blur-2xl" />
            </div>
            <h2 className="text-2xl font-['Oswald'] uppercase tracking-wider mb-2">No Case Files</h2>
            <p className="font-mono text-sm text-gray-500 tracking-wider mb-8">
              // STORIES_LINKED_TO_GHOST_ENTITIES
            </p>
            <Link
              href="/ghosts"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-mono font-bold tracking-widest hover:bg-gray-200 transition-all"
            >
              <Ghost size={16} />
              BROWSE_ENTITIES
            </Link>

            {/* Info Box */}
            <div className="mt-12 border border-white/10 bg-black/30 p-6 text-left max-w-lg mx-auto">
              <h3 className="font-['Oswald'] text-lg uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-red-500" />
                How Stories Work
              </h3>
              <ul className="space-y-3 font-mono text-xs text-gray-500 tracking-wider">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">→</span>
                  Each ghost entity has associated case files
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">→</span>
                  Track your reading progress as you explore
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">→</span>
                  Completed files improve recommendations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">→</span>
                  Stories reveal entity origins and encounters
                </li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/stories/${story.id}`} className="group block">
                    <div className="border border-white/10 bg-black/30 hover:border-white/20 transition-all p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="p-3 bg-white/5 border border-white/10">
                          <BookOpen size={20} className="text-red-500" />
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500 tracking-widest">
                          <Clock size={12} />
                          {story.estimatedReadingTime} MIN
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-['Oswald'] uppercase tracking-wide mb-2 group-hover:text-red-400 transition-colors">
                        {story.title}
                      </h3>
                      
                      {story.ghostEntityId && (
                        <p className="font-mono text-xs text-gray-600 tracking-wider mb-4">
                          LINKED_ENTITY: {story.ghostEntityId.slice(0, 8).toUpperCase()}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="font-mono text-[10px] text-gray-600 tracking-widest">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-xs text-gray-400 group-hover:text-white transition-colors">
                          READ_FILE <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-8 font-mono text-xs text-gray-600 tracking-widest">
            <span>TOTAL_FILES: <span className="text-white">{stories.length}</span></span>
            <span>ARCHIVE_STATUS: <span className="text-green-500">ACCESSIBLE</span></span>
          </div>
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
