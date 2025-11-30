'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useGamepad } from '@/hooks/useGamepad';
import GlobalStyles from '@/components/home/GlobalStyles';
import VirtualCursor from '@/components/home/VirtualCursor';
import GamepadToast from '@/components/home/GamepadToast';
import LoginModal from '@/components/home/LoginModal';
import { GHOSTS } from '@/data/ghosts';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, ArrowDown } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const { isConnected: isControllerActive, cursorPos } = useGamepad(isLoginOpen, () => setIsLoginOpen(false));

  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-red-500/30 selection:text-red-200">
      <GlobalStyles />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <VirtualCursor isActive={isControllerActive} position={cursorPos} />
      <GamepadToast isActive={isControllerActive} />

      {/* Hero Section with Video Background */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <video
                src={GHOSTS[heroIndex].video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-50"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-6 backdrop-blur-sm bg-black/20">
          <div className="flex items-center gap-4">
            <Ghost className="w-8 h-8 text-white" />
            <div>
              <h1 className="font-display font-bold text-xl tracking-[0.2em] text-white leading-none">
                GHOSTYPEDIA
              </h1>
              <p className="font-mono text-[9px] text-gray-400 tracking-widest mt-1">
                ARCHIVE.SYS.V9
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : isAuthenticated ? (
              <>
                <Link href="/ghosts" className="text-sm font-mono text-gray-300 hover:text-white transition-colors">
                  DATABASE
                </Link>
                <span className="text-sm font-mono text-gray-400">
                  AGENT: {user?.username?.toUpperCase()}
                </span>
                <Link href="/dashboard">
                  <button className="px-6 py-2 bg-white text-black font-bold uppercase text-sm tracking-wider hover:bg-gray-200 transition-colors">
                    Dashboard
                  </button>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-6 py-2 border border-white/20 text-white font-bold uppercase text-sm tracking-wider hover:bg-white/10 transition-colors"
                >
                  Sign In
                </button>
                <Link href="/register">
                  <button className="px-6 py-2 bg-red-600 text-white font-bold uppercase text-sm tracking-wider hover:bg-red-700 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center px-8 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 text-xs font-mono text-white/70 mb-6">
              <span className="px-2 py-1 border border-white/20 bg-black/40 rounded">
                {GHOSTS[heroIndex].type}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                THREAT LEVEL: {GHOSTS[heroIndex].danger}%
              </span>
            </div>

            <h2 className="text-7xl lg:text-9xl font-display font-black uppercase tracking-tighter leading-none mb-6">
              {GHOSTS[heroIndex].name}
            </h2>

            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed mb-8 max-w-2xl">
              {GHOSTS[heroIndex].desc}
            </p>

            <div className="flex gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors">
                    Explore Database
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors">
                      Get Started
                    </button>
                  </Link>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-8 py-4 border border-white/20 hover:bg-white/10 text-white font-bold uppercase tracking-wider transition-colors"
                  >
                    Agent Login
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-mono text-gray-500 tracking-widest">SCROLL</span>
          <ArrowDown className="w-5 h-5 text-gray-500" />
        </div>

        {/* Entity Selector */}
        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
          {GHOSTS.map((ghost, idx) => (
            <button
              key={ghost.id}
              onClick={() => setHeroIndex(idx)}
              className={`h-1 transition-all duration-300 ${
                idx === heroIndex ? 'w-16 bg-red-600' : 'w-6 bg-gray-700 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-black py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-display font-bold uppercase tracking-tight mb-4">
              Paranormal Intelligence System
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              An immersive, AI-powered encyclopedia of ghosts, creatures, myths, and paranormal entities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-8 bg-black/60 border border-white/10 backdrop-blur-xl hover:border-red-500/50 transition-colors"
            >
              <div className="text-5xl mb-4">📚</div>
              <h4 className="text-2xl font-display font-bold uppercase mb-3">
                Entity Database
              </h4>
              <p className="text-gray-400 leading-relaxed">
                Comprehensive catalog of paranormal entities, ghosts, and supernatural phenomena from cultures worldwide. Real-time threat assessment included.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 bg-black/60 border border-white/10 backdrop-blur-xl hover:border-red-500/50 transition-colors"
            >
              <div className="text-5xl mb-4">🤖</div>
              <h4 className="text-2xl font-display font-bold uppercase mb-3">
                AI Digital Twin
              </h4>
              <p className="text-gray-400 leading-relaxed">
                Personalized AI assistant trained on paranormal data. Get customized recommendations and insights based on your investigation history.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 bg-black/60 border border-white/10 backdrop-blur-xl hover:border-red-500/50 transition-colors"
            >
              <div className="text-5xl mb-4">🎬</div>
              <h4 className="text-2xl font-display font-bold uppercase mb-3">
                Content Recommendations
              </h4>
              <p className="text-gray-400 leading-relaxed">
                Tailored suggestions for horror movies, paranormal stories, and supernatural myths based on your preferences and viewing patterns.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="relative bg-gradient-to-b from-black to-red-950/20 py-24 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-6xl font-display font-bold uppercase tracking-tight mb-6">
              Join The Investigation
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              Access classified paranormal data. Connect with your AI twin. Explore the unknown.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <button className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white text-lg font-bold uppercase tracking-wider transition-colors">
                  Create Agent Profile
                </button>
              </Link>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-12 py-5 border-2 border-white/20 hover:bg-white/10 text-white text-lg font-bold uppercase tracking-wider transition-colors"
              >
                Agent Login
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ghost className="w-5 h-5 text-gray-500" />
            <span className="font-mono text-sm text-gray-500">
              GHOSTYPEDIA © 2024 // CLASSIFIED
            </span>
          </div>
          <div className="flex gap-6 text-sm font-mono text-gray-500">
            <a href="#" className="hover:text-white transition-colors">TERMS</a>
            <a href="#" className="hover:text-white transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-white transition-colors">CONTACT</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
