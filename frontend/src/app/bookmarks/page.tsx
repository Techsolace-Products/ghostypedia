'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Bookmark, Trash2, Ghost, BookOpen, ExternalLink } from 'lucide-react';
import { bookmarksApi, type Bookmark as BookmarkType } from '@/lib/api';
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

function BookmarksContent() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    if (!confirm('Remove this bookmark?')) return;
    
    try {
      setDeleting(id);
      await bookmarksApi.delete(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getContentLink = (bookmark: BookmarkType) => {
    if (bookmark.contentType === 'ghost_entity') {
      return `/ghosts/${bookmark.contentId}`;
    }
    if (bookmark.contentType === 'story') {
      return `/stories/${bookmark.contentId}`;
    }
    return '#';
  };

  const getContentIcon = (contentType: string) => {
    if (contentType === 'ghost_entity') return Ghost;
    if (contentType === 'story') return BookOpen;
    return Bookmark;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="relative">
          <Bookmark size={48} className="text-white/20 animate-pulse" />
          <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
        </div>
        <p className="font-mono text-sm text-gray-500 mt-6 tracking-widest animate-pulse">
          LOADING_SAVED_ITEMS...
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
        <SectionHeader title="Bookmarks" sub="SAVED_CONTENT_ARCHIVE" />

        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 bg-white/5 p-12 text-center"
          >
            <div className="relative inline-block mb-6">
              <Bookmark size={64} className="text-white/20" />
              <div className="absolute inset-0 bg-red-500/10 blur-2xl" />
            </div>
            <h2 className="text-2xl font-['Oswald'] uppercase tracking-wider mb-2">No Bookmarks</h2>
            <p className="font-mono text-sm text-gray-500 tracking-wider mb-8">
              // SAVE_CONTENT_TO_ACCESS_LATER
            </p>
            <Link
              href="/ghosts"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-mono font-bold tracking-widest hover:bg-gray-200 transition-all"
            >
              <Ghost size={16} />
              BROWSE_ARCHIVE
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {bookmarks.map((bookmark, index) => {
                const Icon = getContentIcon(bookmark.contentType);
                return (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="group border border-white/10 bg-black/30 hover:border-white/20 transition-all"
                  >
                    <div className="p-6 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-white/5 border border-white/10">
                          <Icon size={20} className="text-red-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 bg-red-900/30 border border-red-500/30 text-[10px] font-mono text-red-400 uppercase tracking-widest">
                              {bookmark.contentType.replace('_', ' ')}
                            </span>
                            {bookmark.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] font-mono text-gray-600 tracking-wider">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <p className="font-mono text-xs text-gray-500 tracking-wider mb-2">
                            ID: {bookmark.contentId.slice(0, 12).toUpperCase()}
                          </p>
                          {bookmark.notes && (
                            <p className="font-['Rajdhani'] text-gray-400 text-sm">{bookmark.notes}</p>
                          )}
                          <p className="font-mono text-[10px] text-gray-600 mt-3 tracking-wider">
                            SAVED: {new Date(bookmark.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={getContentLink(bookmark)}
                          className="p-3 border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                        >
                          <ExternalLink size={16} className="text-gray-400" />
                        </Link>
                        <button
                          onClick={() => handleDelete(bookmark.id)}
                          disabled={deleting === bookmark.id}
                          className="p-3 border border-white/10 bg-white/5 hover:bg-red-900/30 hover:border-red-500/30 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={16} className={deleting === bookmark.id ? 'animate-pulse text-red-500' : 'text-gray-400 hover:text-red-500'} />
                        </button>
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
            <span>TOTAL_SAVED: <span className="text-white">{bookmarks.length}</span></span>
            <span>SYNC_STATUS: <span className="text-green-500">CURRENT</span></span>
          </div>
        </div>
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
