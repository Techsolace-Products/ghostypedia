'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { 
  ChevronLeft, Bookmark, Ghost, AlertTriangle, Globe, 
  Sparkles, BookOpen, Clock, Eye, Share2, ExternalLink 
} from 'lucide-react';
import { ghostsApi, storiesApi, bookmarksApi, type GhostEntity, type Story } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const SectionHeader = ({ title, sub }: { title: string; sub: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-8 border-l-4 border-white/20 pl-6">
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

const DangerMeter = ({ level }: { level: number }) => {
  const labels = ['HARMLESS', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'];
  const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-700'];
  const textColors = ['text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500', 'text-red-700'];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-500 tracking-widest">THREAT_LEVEL</span>
        <span className={`font-mono text-sm font-bold ${textColors[level - 1]}`}>
          {labels[level - 1]}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 h-3 ${i <= level ? colors[level - 1] : 'bg-white/10'} transition-colors`}
          />
        ))}
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={14} className="text-red-500" />
      <span className="font-mono text-[10px] text-gray-500 tracking-widest">{label}</span>
    </div>
    <p className="font-['Rajdhani'] text-lg text-white">{value || 'Unknown'}</p>
  </div>
);

export default function GhostDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [ghost, setGhost] = useState<GhostEntity | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarking, setBookmarking] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

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
    if (!ghost || !isAuthenticated || bookmarking) return;
    
    try {
      setBookmarking(true);
      await bookmarksApi.create({
        contentId: ghost.id,
        contentType: 'ghost_entity',
        tags: ['favorite'],
      });
      setBookmarked(true);
    } catch (error) {
      console.error('Failed to bookmark:', error);
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="relative">
          <Ghost size={64} className="text-white/20 animate-pulse" />
          <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
        </div>
        <p className="font-mono text-sm text-gray-500 mt-6 tracking-widest animate-pulse">
          LOADING_ENTITY_DATA...
        </p>
      </div>
    );
  }

  if (!ghost) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <Ghost size={64} className="text-white/20 mb-6" />
        <h1 className="font-['Oswald'] text-3xl uppercase tracking-wider mb-2">Entity Not Found</h1>
        <p className="font-mono text-sm text-gray-500 tracking-wider mb-8">// RECORD_DOES_NOT_EXIST</p>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-mono tracking-widest hover:bg-gray-200 transition-all"
        >
          <ChevronLeft size={16} />
          RETURN_TO_HQ
        </Link>
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

      {/* Hero Section with Image */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {ghost.imageUrl ? (
          <img
            src={ghost.imageUrl}
            alt={ghost.name}
            className="w-full h-full object-cover opacity-40 grayscale"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <Ghost size={120} className="text-white/5" />
          </div>
        )}
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 md:left-12 z-20">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur border border-white/10 text-gray-400 hover:text-white font-mono text-sm tracking-widest transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            HQ
          </Link>
        </div>

        {/* Entity ID Badge */}
        <div className="absolute top-6 right-6 md:right-12 z-20">
          <div className="px-4 py-2 bg-black/50 backdrop-blur border border-white/10 font-mono text-xs tracking-widest text-gray-500">
            ID: {ghost.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-red-900/50 border border-red-500/30 text-red-400 font-mono text-xs tracking-widest uppercase">
                {ghost.type}
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 font-mono text-xs tracking-widest">
                {ghost.origin}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-['Oswald'] font-bold uppercase tracking-tight mb-4">
              {ghost.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12">
        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 mb-12 pb-8 border-b border-white/10">
          {isAuthenticated && (
            <button
              onClick={handleBookmark}
              disabled={bookmarking || bookmarked}
              className={`flex items-center gap-2 px-6 py-3 font-mono text-sm tracking-widest transition-all ${
                bookmarked 
                  ? 'bg-green-900/30 border border-green-500/30 text-green-400'
                  : 'bg-white text-black hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              <Bookmark size={16} className={bookmarked ? 'fill-current' : ''} />
              {bookmarked ? 'BOOKMARKED' : bookmarking ? 'SAVING...' : 'BOOKMARK'}
            </button>
          )}
          <button className="flex items-center gap-2 px-6 py-3 border border-white/20 bg-white/5 font-mono text-sm tracking-widest hover:bg-white/10 transition-all">
            <Share2 size={16} />
            SHARE
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-white/20 bg-white/5 font-mono text-sm tracking-widest hover:bg-white/10 transition-all">
            <Eye size={16} />
            REPORT_SIGHTING
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <h2 className="flex items-center gap-3 font-['Oswald'] text-2xl uppercase tracking-wider mb-6">
                <BookOpen size={20} className="text-red-500" />
                Entity Description
              </h2>
              <p className="font-['Rajdhani'] text-lg text-gray-300 leading-relaxed">
                {ghost.description}
              </p>
            </section>

            {/* Characteristics */}
            {ghost.characteristics && ghost.characteristics.length > 0 && (
              <section>
                <h2 className="flex items-center gap-3 font-['Oswald'] text-2xl uppercase tracking-wider mb-6">
                  <Sparkles size={20} className="text-red-500" />
                  Known Characteristics
                </h2>
                <div className="flex flex-wrap gap-3">
                  {ghost.characteristics.map((char, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white/5 border border-white/10 font-mono text-sm tracking-wider hover:bg-white/10 transition-colors"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Related Stories */}
            {stories.length > 0 && (
              <section>
                <h2 className="flex items-center gap-3 font-['Oswald'] text-2xl uppercase tracking-wider mb-6">
                  <BookOpen size={20} className="text-red-500" />
                  Related Case Files
                </h2>
                <div className="space-y-4">
                  {stories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.id}`}
                      className="group block border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-['Oswald'] text-xl uppercase tracking-wide group-hover:text-red-400 transition-colors">
                            {story.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 font-mono text-xs text-gray-500 tracking-wider">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {story.estimatedReadingTime} MIN_READ
                            </span>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Danger Level */}
            <div className="border border-white/10 bg-black/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="font-mono text-xs text-gray-500 tracking-widest">THREAT_ASSESSMENT</span>
              </div>
              <DangerMeter level={ghost.dangerLevel} />
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 gap-4">
              <InfoCard icon={Globe} label="ORIGIN" value={ghost.origin} />
              <InfoCard icon={Sparkles} label="CULTURAL_CONTEXT" value={ghost.culturalContext} />
            </div>

            {/* Tags */}
            {ghost.tags && ghost.tags.length > 0 && (
              <div className="border border-white/10 bg-black/30 p-6">
                <span className="font-mono text-xs text-gray-500 tracking-widest block mb-4">
                  CLASSIFICATION_TAGS
                </span>
                <div className="flex flex-wrap gap-2">
                  {ghost.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono text-gray-500 tracking-wider hover:text-white transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border border-white/10 bg-black/30 p-6 space-y-3">
              <span className="font-mono text-xs text-gray-500 tracking-widest block mb-4">
                RECORD_METADATA
              </span>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-600">CREATED</span>
                <span className="text-gray-400">
                  {ghost.createdAt ? new Date(ghost.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-600">UPDATED</span>
                <span className="text-gray-400">
                  {ghost.updatedAt ? new Date(ghost.updatedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-600">STATUS</span>
                <span className="text-green-500">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-8 font-mono text-xs text-gray-600 tracking-widest">
            <span>ENTITY_ID: <span className="text-gray-400">{ghost.id.slice(0, 12).toUpperCase()}</span></span>
            <span>DATABASE: <span className="text-green-500">SYNCED</span></span>
            <span>CLEARANCE: <span className="text-red-400">LEVEL_5</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
