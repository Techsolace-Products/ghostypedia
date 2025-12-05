"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence
} from "framer-motion";
import {
  Activity, Cpu, Ghost, Fingerprint,
  ArrowDown, ChevronRight, Lock, X,
  Radio, Gamepad2, UserPlus, KeyRound, User, LogOut,
  BookOpen, Bookmark, Sparkles, Settings
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useAuth } from "@/hooks/useAuth";

// --- ASSETS & DATA ---
const GHOSTS = [
  {
    id: "0404",
    name: "SHADOW MAN",
    type: "INTERDIMENSIONAL",
    img: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop",
    video: "/background1.mp4",
    desc: "Feeds on cortisol. Do not engage in REM state. Can manifest via sleep paralysis.",
    danger: 75
  },
  {
    id: "0112",
    name: "LEGION",
    type: "DEMONIC",
    img: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop",
    video: "/background2.mp4",
    desc: "Hive mind manifestation. Sector lockdown required immediately upon contact.",
    danger: 100
  },
  {
    id: "0991",
    name: "POLTERGEIST",
    type: "KINETIC",
    img: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=1000&auto=format&fit=crop",
    video: "/background3.mp4",
    desc: "High-energy object manipulation. Class 4 telekinetic surges observed.",
    danger: 60
  }
];

const TEAM = [
  { name: "ROHAN SIDHU", role: "DEVELOPER", status: "ACTIVE", img: "/team/1.png" },
  { name: "SAMARTH MAHAPATRA", role: "DEVELOPER", status: "ACTIVE", img: "/team/2.png" },
  { name: "PRANAV KUMAR", role: "DEVELOPER", status: "ACTIVE", img: "/team/3.png" },
];

// --- UTILS ---
const ScrambleText = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let i = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const interval = setInterval(() => {
      setDisplay(text.split("").map((char: string, index: number) => {
        if (index < i) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      if (i >= text.length) clearInterval(interval);
      i += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{display}</span>;
};

// --- CUSTOM HOOK: GAMEPAD CONTROL WITH VIRTUAL CURSOR ---
import { useGamepad } from "@/hooks/useGamepad";

// --- COMPONENTS ---

const SectionHeader = ({ title, sub }: { title: string; sub: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-16 border-l-4 border-white/20 pl-6">
      <motion.h2
        initial={{ x: -20, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        className="text-5xl md:text-7xl font-['Oswald'] font-bold uppercase tracking-tighter text-white"
      >
        {title}
      </motion.h2>
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

type AuthTab = 'login' | 'register' | 'reset';

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const tabs = [
    { id: 'login' as AuthTab, label: 'LOGIN', icon: Lock },
    { id: 'register' as AuthTab, label: 'REGISTER', icon: UserPlus },
    { id: 'reset' as AuthTab, label: 'RESET', icon: KeyRound },
  ];

  const getTitle = () => {
    switch (activeTab) {
      case 'login': return 'Agent Authentication';
      case 'register': return 'New Agent Registration';
      case 'reset': return 'Password Recovery';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'login': return 'SECURE_LOGIN_REQUIRED';
      case 'register': return 'CREATE_NEW_IDENTITY';
      case 'reset': return 'RECOVER_ACCESS_CODES';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-black border border-white/20 relative shadow-[0_0_50px_rgba(255,0,0,0.1)]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-500 hover:text-white focus:text-red-500 focus:outline-none transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-4 font-mono text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white border-b-2 border-red-500'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6 justify-center text-red-500">
                <Lock size={16} />
                <span className="font-mono text-xs tracking-widest">{getSubtitle()}</span>
              </div>

              <h2 className="text-2xl font-['Oswald'] font-bold text-center mb-8 uppercase text-white">
                {getTitle()}
              </h2>

              {/* Auth Forms with custom styling wrapper */}
              <div className="auth-form-dark">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'login' && <LoginForm />}
                    {activeTab === 'register' && <RegisterForm />}
                    {activeTab === 'reset' && <ResetPasswordForm />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-2">
                {activeTab === 'login' && (
                  <>
                    <button
                      onClick={() => setActiveTab('reset')}
                      className="text-xs text-gray-500 hover:text-red-500 font-mono transition-colors"
                    >
                      FORGOT_PASSCODE?
                    </button>
                    <div className="text-xs text-gray-600 font-mono">
                      NO_IDENTITY? {' '}
                      <button
                        onClick={() => setActiveTab('register')}
                        className="text-white hover:text-red-500 transition-colors"
                      >
                        CREATE_ONE
                      </button>
                    </div>
                  </>
                )}
                {activeTab === 'register' && (
                  <div className="text-xs text-gray-600 font-mono">
                    EXISTING_AGENT? {' '}
                    <button
                      onClick={() => setActiveTab('login')}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      AUTHENTICATE
                    </button>
                  </div>
                )}
                {activeTab === 'reset' && (
                  <div className="text-xs text-gray-600 font-mono">
                    REMEMBER_CODES? {' '}
                    <button
                      onClick={() => setActiveTab('login')}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      RETURN_TO_LOGIN
                    </button>
                  </div>
                )}
              </div>

              {/* Gamepad hint */}
              <div className="flex justify-center mt-6">
                <span className="text-[10px] text-gray-600 font-mono flex items-center gap-2">
                  PRESS <span className="border border-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-[8px] text-red-500">B</span> TO CANCEL
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- MAIN PAGE ---

export default function App() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [activeSection, setActiveSection] = useState("hero");
  const [isBooted, setIsBooted] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);

  // Refs
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const ghostsRef = useRef<HTMLDivElement>(null);

  // --- GAMEPAD HOOK INTEGRATION ---
  const { isConnected: isControllerActive, cursorPos } = useGamepad(isLoginOpen, () => setIsLoginOpen(false));

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    // Boot Timer
    setTimeout(() => setIsBooted(true), 500);

    // Hero Video Carousel Timer (Cycles every 8 seconds)
    const videoInterval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % GHOSTS.length);
    }, 8000);

    // Scroll Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.2 });

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      clearInterval(videoInterval);
    };
  }, []);

  // Parallax Logic
  const { scrollYProgress } = useScroll({ target: ghostsRef });
  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-red-500/30 selection:text-red-200">

      {/* GLOBAL STYLES & CONTROLLER FOCUS STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;400;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; width: 100%; background-color: #050505; }
        
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }

        /* Controller Focus Ring Styling */
        :focus-visible {
            outline: 2px solid #ef4444; /* Red Outline */
            outline-offset: 4px;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
            border-radius: 2px;
        }

        /* Simulate button press visual */
        .active-click {
            transform: scale(0.95);
            background-color: rgba(255, 255, 255, 0.2) !important;
        }

        /* Gamepad hover effect */
        .gamepad-hover {
            outline: 3px solid #ef4444 !important;
            outline-offset: 4px;
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.6) !important;
            transform: scale(1.02);
            transition: all 0.15s ease;
        }

        /* Dark theme for auth forms */
        .auth-form-dark input {
            background: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        .auth-form-dark input:focus {
            border-color: #ef4444 !important;
            background: rgba(255, 255, 255, 0.1) !important;
        }
        .auth-form-dark input::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
        }
        .auth-form-dark label {
            color: rgba(255, 255, 255, 0.6) !important;
            font-family: monospace !important;
            text-transform: uppercase !important;
            font-size: 10px !important;
            letter-spacing: 0.1em !important;
        }
        .auth-form-dark button[type="submit"] {
            background: white !important;
            color: black !important;
            font-family: monospace !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
        }
        .auth-form-dark button[type="submit"]:hover {
            background: #e5e5e5 !important;
        }
        .auth-form-dark .bg-red-50 {
            background: rgba(239, 68, 68, 0.1) !important;
            border-color: rgba(239, 68, 68, 0.3) !important;
        }
        .auth-form-dark .text-red-600 {
            color: #f87171 !important;
        }
        .auth-form-dark .bg-green-50 {
            background: rgba(34, 197, 94, 0.1) !important;
            border-color: rgba(34, 197, 94, 0.3) !important;
        }
        .auth-form-dark .text-green-600 {
            color: #4ade80 !important;
        }
      `}</style>

      <AuthModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* --- VIRTUAL GAMEPAD CURSOR --- */}
      {isControllerActive && (
        <div
          className="fixed pointer-events-none z-[10001] transition-transform duration-75"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-8 h-8 bg-red-500 rounded-full opacity-30 blur-md animate-pulse" />
            {/* Main cursor */}
            <div className="relative w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-[2px] bg-red-500/50" />
              <div className="w-[2px] h-12 bg-red-500/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      )}

      {/* --- CONTROLLER CONNECTED TOAST --- */}
      <div className={`fixed top-4 right-4 z-[11000] transition-transform duration-500 ${isControllerActive ? 'translate-x-0' : 'translate-x-64'}`}>
        <div className="bg-white text-black px-4 py-2 flex items-center gap-3 font-mono text-xs font-bold tracking-widest border-2 border-green-500">
          <Gamepad2 size={16} /> GAMEPAD_ACTIVE
        </div>
      </div>

      {/* --- BOOT OVERLAY --- */}
      <div
        className={`fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ${isBooted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="w-64 h-1 bg-gray-900 rounded overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-[1500ms] ease-out"
            style={{ width: isBooted ? '100%' : '0%' }}
          />
        </div>
        <div className="mt-4 font-mono text-[10px] tracking-[0.3em] text-gray-500 animate-pulse">
          INITIALIZING_NEURAL_LINK...
        </div>
      </div>

      {/* --- CINEMATIC OVERLAY --- */}
      <div className="fixed inset-0 pointer-events-none z-[9000]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.02]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-[0.1]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,#000000_100%)] opacity-80" />
      </div>

      {/* --- SIDEBAR NAVIGATION --- */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-black/80 backdrop-blur-md border-r border-white/10 z-[100] hidden md:flex flex-col items-center py-10 justify-between">
        <Ghost className="w-8 h-8 text-white" />

        <div className="flex flex-col gap-8 items-center">
          {['hero', 'about', 'ghosts', 'team'].map((item) => (
            <div key={item} className="relative group flex items-center justify-center">
              <button
                onClick={() => scrollTo(item)}
                className="relative z-10 w-4 h-4 flex items-center justify-center focus:outline-none focus:ring-0"
                tabIndex={-1} // Remove from focus loop as sidebar is decorative
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSection === item ? 'bg-white scale-150 shadow-[0_0_10px_white]' : 'bg-gray-600 group-hover:bg-gray-400'}`} />
              </button>
              <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity uppercase whitespace-nowrap pointer-events-none">
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 items-center">
          {isAuthenticated ? (
            <>
              {/* Archive Link */}
              <button 
                onClick={() => router.push('/ghosts')} 
                className="group relative focus:text-red-500 focus:outline-none"
                title="Ghost Archive"
              >
                <Ghost size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  ARCHIVE
                </span>
              </button>
              {/* Stories Link */}
              <button 
                onClick={() => router.push('/stories')} 
                className="group relative focus:text-red-500 focus:outline-none"
                title="Stories"
              >
                <BookOpen size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  STORIES
                </span>
              </button>
              {/* Bookmarks Link */}
              <button 
                onClick={() => router.push('/bookmarks')} 
                className="group relative focus:text-red-500 focus:outline-none"
                title="Bookmarks"
              >
                <Bookmark size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  BOOKMARKS
                </span>
              </button>
              {/* Recommendations Link */}
              <button 
                onClick={() => router.push('/recommendations')} 
                className="group relative focus:text-red-500 focus:outline-none"
                title="Recommendations"
              >
                <Sparkles size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  FOR_YOU
                </span>
              </button>
              {/* Divider */}
              <div className="w-4 h-[1px] bg-white/20 my-1" />
              {/* Preferences Link */}
              <button 
                onClick={() => router.push('/preferences')} 
                className="group relative focus:text-red-500 focus:outline-none"
                title="Preferences"
              >
                <Settings size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  SETTINGS
                </span>
              </button>
              {/* User Profile / Dashboard */}
              <button 
                onClick={() => router.push('/dashboard')} 
                className="group relative focus:text-red-500 focus:outline-none"
                title="Dashboard"
              >
                <User size={16} className="text-green-500 group-hover:text-white transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  DASHBOARD
                </span>
              </button>
              {/* Logout */}
              <button 
                onClick={handleLogout} 
                className="group relative focus:text-red-500 focus:outline-none"
                title="Logout"
              >
                <LogOut size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  LOGOUT
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Archive Link (public) */}
              <button 
                onClick={() => router.push('/ghosts')} 
                className="group relative focus:text-red-500 focus:outline-none"
                title="Ghost Archive"
              >
                <Ghost size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  ARCHIVE
                </span>
              </button>
              {/* Login */}
              <button onClick={() => setIsLoginOpen(true)} className="group relative focus:text-red-500 focus:outline-none">
                <Lock size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                <span className="absolute left-full ml-4 bg-white/10 px-2 py-1 text-[10px] font-mono tracking-widest backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  LOGIN
                </span>
              </button>
            </>
          )}
          <Activity size={16} className="text-green-500" />
        </div>
      </nav>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="md:pl-20">

        {/* 1. HERO SECTION (DYNAMIC BACKGROUND & TEXT) */}
        <section
          id="hero"
          ref={(el) => { sectionRefs.current['hero'] = el; }}
          className="relative h-screen w-full overflow-hidden flex flex-col justify-center px-8 md:px-24"
        >
          <div className="absolute inset-0 z-0 bg-black">
            {/* Dynamic Video Cross-fade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
              >
                <video
                  src={GHOSTS[heroIndex].video}
                  className="w-full h-full object-cover"
                  autoPlay loop muted playsInline
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
          </div>

          <div className="relative z-10 max-w-4xl">
            {/* Text Content Wrapper */}
            <AnimatePresence mode="wait">
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={isBooted ? { opacity: 1, y: 0 } : {}}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-2 py-1 border border-white/20 bg-white/5 backdrop-blur text-[10px] font-mono tracking-widest uppercase text-gray-400">
                    GHOSTPEDIA ARCHIVE
                  </span>
                  {/* Current Signal Indicator */}
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-900/30 border border-red-500/30 text-[9px] font-mono text-red-400 uppercase tracking-widest">
                    <Radio size={10} className="animate-pulse" />
                    ID: {GHOSTS[heroIndex].id} // SIGNAL_DETECTED
                  </div>
                </div>

                {/* Dynamic Title based on Ghost Name */}
                <h1 className="text-7xl md:text-9xl font-['Oswald'] font-bold uppercase tracking-tight mb-4 text-white leading-[0.9]">
                  <ScrambleText text={GHOSTS[heroIndex].name} />
                </h1>

                {/* Dynamic Description */}
                <p className="font-['Rajdhani'] text-xl md:text-2xl text-gray-300 tracking-[0.2em] uppercase max-w-lg mb-12 border-l-2 border-white/20 pl-6 min-h-[5rem]">
                  {GHOSTS[heroIndex].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-6">
              <button
                onClick={() => scrollTo('ghosts')}
                className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-mono font-bold tracking-widest hover:bg-gray-200 transition-all focus:bg-red-600 focus:text-white focus:outline-none"
              >
                ACCESS_FILE <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-3 px-8 py-4 border border-green-500/50 bg-green-900/20 backdrop-blur font-mono font-bold tracking-widest hover:bg-green-900/40 transition-all focus:bg-green-600 focus:text-white focus:outline-none text-green-400"
                >
                  <User size={14} />
                  {user?.username?.toUpperCase() || 'DASHBOARD'}
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-3 px-8 py-4 border border-white/20 bg-black/50 backdrop-blur font-mono font-bold tracking-widest hover:bg-white/10 transition-all focus:bg-white focus:text-black focus:outline-none"
                >
                  AGENT_LOGIN <Lock size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="absolute bottom-12 left-0 w-full flex justify-center animate-bounce opacity-50">
            <ArrowDown size={24} />
          </div>
        </section>

        {/* 2. ABOUT SECTION */}
        <section
          id="about"
          ref={(el) => { sectionRefs.current['about'] = el; }}
          className="min-h-screen py-24 px-8 md:px-24 border-b border-white/5 bg-[#080808] relative overflow-hidden flex items-center"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Fingerprint size={600} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full z-10">
            <div>
              <SectionHeader title="The Initiative" sub="CLASSIFIED_BRIEFING" />
              <div className="space-y-6 text-lg text-gray-400 font-['Rajdhani'] leading-relaxed text-justify">
                <p>
                  <strong className="text-white">GHOSTPEDIA</strong> was established in 1982 following the [REDACTED] incident in Yorkshire. We are not ghost hunters. We are archivists of the impossible.
                </p>
                <p>
                  Utilizing high-frequency spectral imaging and localized EVP monitoring, we catalog entities that defy the laws of physics. Our mission is simple: <span className="text-white border-b border-red-500">Observe. Catalog. Survive.</span>
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                {[
                  { label: "CASES SOLVED", val: "842" },
                  { label: "AGENTS LOST", val: "14" },
                  { label: "CONTAINMENT", val: "94%" },
                  { label: "LAST UPDATE", val: "NOW" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors cursor-default">
                    <div className="text-[10px] font-mono text-gray-500 tracking-widest mb-2">{stat.label}</div>
                    <div className="text-4xl font-['Oswald'] text-white">{stat.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[600px] border border-white/10 bg-black/50 p-2 group">
              <div className="absolute inset-0 border-[1px] border-white/5 m-4 pointer-events-none z-20" />
              <img
                src="https://images.unsplash.com/photo-1542259681-d4cd7193bc86?q=80&w=1000&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                alt="Evidence"
              />
              <div className="absolute bottom-8 left-8 bg-black/90 backdrop-blur p-4 border border-white/20 z-20">
                <div className="text-[10px] font-mono mb-1 text-red-500">EVIDENCE #9921</div>
                <div className="text-sm font-bold">ECTOPLASM SAMPLE B</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. GHOSTS SCROLLER */}
        <section
          id="ghosts"
          ref={(el) => {
            ghostsRef.current = el as HTMLDivElement;
            sectionRefs.current['ghosts'] = el;
          }}
          className="relative h-[250vh] bg-black"
        >
          <div className="sticky top-0 h-screen overflow-hidden bg-[#050505] flex flex-col justify-center border-y border-white/10">

            <div className="absolute top-8 left-8 md:left-24 z-20">
              <SectionHeader title="The Archive" sub="LEVEL_5_CLEARANCE" />
            </div>

            <div className="relative w-full mt-20">
              <motion.div style={{ x }} className="flex gap-24 px-24 w-max items-center">
                {GHOSTS.map((ghost) => (
                  <div key={ghost.id} className="relative w-[85vw] md:w-[600px] h-[55vh] md:h-[500px] group bg-black/20">
                    {/* CARD CONTAINER */}
                    <div className="absolute inset-0 border border-white/10 overflow-hidden bg-gray-900">
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                      <img
                        src={ghost.img}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out opacity-80 group-hover:opacity-100"
                        alt={ghost.name}
                      />
                      {/* Scan Effect */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-white/50 shadow-[0_0_20px_white] animate-[scan_3s_linear_infinite] opacity-0 group-hover:opacity-100 z-10" />
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                      <div className="flex justify-between items-end mb-4 border-b border-white/20 pb-4">
                        <div>
                          <span className="bg-red-600 text-black px-2 py-0.5 text-[10px] font-bold font-mono">THREAT: {ghost.danger}%</span>
                          <h3 className="text-4xl md:text-5xl font-['Oswald'] uppercase mt-2 drop-shadow-lg text-white">{ghost.name}</h3>
                        </div>
                        <span className="text-4xl font-['Rajdhani'] text-white/20 font-bold">{ghost.id}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-mono text-gray-400">
                        <span>CLASS: {ghost.type}</span>
                        <button className="flex items-center gap-2 text-white hover:text-red-500 transition-colors uppercase text-xs tracking-widest focus:text-red-500 focus:outline-none">
                          Open_File <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="absolute bottom-12 left-24 flex items-center gap-4 text-[10px] font-mono text-gray-500">
              <div className="w-12 h-[1px] bg-gray-500" />
              SCROLL TO NAVIGATE DATABASE
            </div>
          </div>
        </section>

        {/* 4. TEAM SECTION */}
        <section
          id="team"
          ref={(el) => { sectionRefs.current['team'] = el; }}
          className="py-32 px-8 md:px-24 bg-[#0a0a0a]"
        >
          <SectionHeader title="Operatives" sub="ACTIVE_PERSONNEL" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member, idx) => (
              <div key={idx} className="group relative bg-white/5 border border-white/10 overflow-hidden hover:border-white/30 transition-colors">
                <div className="h-96 w-full overflow-hidden relative">
                  <img src={member.img} className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0" alt={member.name} />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-all duration-300" />
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-8 text-center">
                    <Fingerprint size={48} className="text-white/20 mb-4" />
                    <p className="font-mono text-xs text-green-500 mb-2 tracking-widest">IDENTITY_VERIFIED</p>
                    <p className="text-sm text-gray-400 font-['Rajdhani'] leading-relaxed">
                      Clearance Level 4. <br />
                      Specializes in containment protocols and spectral analysis.
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold font-['Oswald'] tracking-wide text-white">{member.name}</h4>
                      <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-wider">{member.role}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${member.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'} animate-pulse`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FOOTER */}
        <footer className="bg-black border-t border-white/10 pt-24 pb-12 px-8 md:px-24 font-mono text-xs text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Ghost className="w-6 h-6" />
                <span className="text-2xl font-['Oswald'] font-bold tracking-tighter">GHOSTPEDIA</span>
              </div>
              <p className="text-gray-500 max-w-sm leading-relaxed mb-8">
                The world's secure archive for paranormal phenomena.
                Unauthorized access is a federal offense.
                We are watching.
              </p>
              <div className="flex gap-0">
                <input type="email" placeholder="ENCRYPTED_EMAIL" className="bg-white/5 border border-white/20 p-4 w-64 focus:outline-none focus:border-white text-white placeholder:text-gray-600 focus:ring-0" />
                <button className="bg-white text-black px-6 font-bold hover:bg-gray-200 uppercase tracking-widest focus:bg-red-600 focus:text-white focus:outline-none">Join</button>
              </div>
            </div>

            <div>
              <h5 className="text-gray-400 mb-6 tracking-widest uppercase">Navigation</h5>
              <ul className="space-y-4 text-gray-600">
                {['HOME', 'ARCHIVE', 'AGENTS', 'LOGIN'].map(link => (
                  <li key={link} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                    <span className="opacity-0 hover:opacity-100 text-red-500 transition-opacity">/</span> {link}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-gray-400 mb-6 tracking-widest uppercase">System_Status</h5>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-gray-600">SERVER</span>
                  <span className="text-green-500">ONLINE</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-gray-600">THREAT</span>
                  <span className="text-orange-500">MODERATE</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-gray-600">ENCRYPTION</span>
                  <span className="text-white">AES-256</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-gray-700">
            <div>© 2024 GHOSTPEDIA INC. // ALL RIGHTS RESERVED</div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer transition-colors">PRIVACY</span>
              <span className="hover:text-white cursor-pointer transition-colors">TERMS</span>
              <Cpu size={14} />
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}