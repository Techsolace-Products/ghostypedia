'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Ghost, BookOpen, Bookmark, Sparkles, Settings, 
  ChevronLeft, ChevronRight, User, LogOut, Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SectionHeader = ({ title, sub }: { title: string; sub: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-8 border-l-4 border-white/20 pl-6">
      <motion.h1
        initial={{ x: -20, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        className="text-4xl md:text-6xl font-['Oswald'] font-bold uppercase tracking-tighter text-white"
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

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const features = [
    {
      title: 'Ghost Archive',
      description: 'Explore our comprehensive database of ghosts, spirits, and paranormal entities',
      href: '/ghosts',
      icon: Ghost,
      status: 'ONLINE',
    },
    {
      title: 'Bookmarks',
      description: 'Save and organize your favorite ghosts, stories, and content',
      href: '/bookmarks',
      icon: Bookmark,
      status: 'SYNCED',
    },
    {
      title: 'Recommendations',
      description: 'Get personalized content recommendations based on your interests',
      href: '/recommendations',
      icon: Sparkles,
      status: 'ACTIVE',
    },
    {
      title: 'Case Files',
      description: 'Read spooky stories and track your reading progress',
      href: '/stories',
      icon: BookOpen,
      status: 'ACCESSIBLE',
    },
    {
      title: 'Preferences',
      description: 'Configure your spookiness level and notification settings',
      href: '/preferences',
      icon: Settings,
      status: 'CONFIGURED',
    },
  ];

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
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm tracking-widest mb-8 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          RETURN_TO_HOME
        </Link>

        {/* Header */}
        <SectionHeader title="Agent Dashboard" sub="COMMAND_CENTER" />

        {/* Agent Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/10 bg-black/30 p-6 md:p-8 mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/5 border border-white/10">
                <User size={32} className="text-green-500" />
              </div>
              <div>
                <h2 className="font-['Oswald'] text-2xl uppercase tracking-wider">{user?.username}</h2>
                <p className="font-mono text-xs text-gray-500 tracking-widest mt-1">
                  CLEARANCE: LEVEL_5
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-green-500" />
              <span className="font-mono text-xs text-green-500 tracking-widest">ACTIVE</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div>
              <span className="font-mono text-[10px] text-gray-600 tracking-widest">EMAIL</span>
              <p className="font-['Rajdhani'] text-gray-300 mt-1">{user?.email}</p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-gray-600 tracking-widest">AGENT_ID</span>
              <p className="font-mono text-xs text-gray-400 mt-1">{user?.id?.slice(0, 12).toUpperCase()}</p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-gray-600 tracking-widest">ENLISTED</span>
              <p className="font-['Rajdhani'] text-gray-300 mt-1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'CLASSIFIED'}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-gray-600 tracking-widest">STATUS</span>
              <p className="font-mono text-xs text-green-500 mt-1">VERIFIED</p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <h3 className="font-['Oswald'] text-xl uppercase tracking-wider mb-6 flex items-center gap-3">
          <Ghost size={18} className="text-red-500" />
          System Access
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={feature.href} className="group block">
                <div className="border border-white/10 bg-black/30 p-6 hover:border-white/20 hover:bg-white/5 transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/5 border border-white/10 group-hover:border-red-500/30 transition-colors">
                      <feature.icon size={20} className="text-red-500" />
                    </div>
                    <span className="font-mono text-[10px] text-green-500 tracking-widest">
                      {feature.status}
                    </span>
                  </div>
                  
                  <h4 className="font-['Oswald'] text-lg uppercase tracking-wide mb-2 group-hover:text-red-400 transition-colors">
                    {feature.title}
                  </h4>
                  
                  <p className="font-['Rajdhani'] text-sm text-gray-500 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center gap-1 font-mono text-xs text-gray-600 group-hover:text-white transition-colors">
                    ACCESS <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <h3 className="font-['Oswald'] text-xl uppercase tracking-wider mb-6 flex items-center gap-3">
          <Activity size={18} className="text-red-500" />
          System Status
        </h3>
        
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'ENTITIES', value: '∞', status: 'GROWING' },
            { label: 'CASE_FILES', value: '∞', status: 'ACCESSIBLE' },
            { label: 'AI_TWIN', value: '✓', status: 'READY' },
            { label: 'SYNC', value: '100%', status: 'CURRENT' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="border border-white/10 bg-black/30 p-6 text-center"
            >
              <div className="text-3xl font-['Oswald'] text-white mb-2">{stat.value}</div>
              <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">{stat.label}</div>
              <div className="font-mono text-[10px] text-green-500 tracking-widest">{stat.status}</div>
            </motion.div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-8 py-4 border border-red-500/30 bg-red-900/10 font-mono tracking-widest text-red-400 hover:bg-red-900/30 transition-all"
          >
            <LogOut size={16} />
            TERMINATE_SESSION
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-8 font-mono text-xs text-gray-600 tracking-widest">
            <span>AGENT: <span className="text-gray-400">{user?.username?.toUpperCase()}</span></span>
            <span>SYSTEMS: <span className="text-green-500">OPERATIONAL</span></span>
            <span>ENCRYPTION: <span className="text-white">AES-256</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
