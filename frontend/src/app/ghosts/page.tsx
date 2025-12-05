"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Play, Search, Ghost, Plus,
  AlertTriangle, BookOpen, Bookmark
} from "lucide-react";
import { useGamepad } from "@/hooks/useGamepad";
import { ghostsApi, type GhostEntity } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

// Temp images for ghosts without images
const TEMP_IMAGES = [
  "/images/ghosts/demon.png",
  "/images/ghosts/revenant.png",
  "/images/ghosts/banshee.png",
  "/images/ghosts/poltergeist.png",
  "/images/ghosts/wraith.png",
];

const getGhostImage = (ghost: GhostEntity, index: number) => {
  if (ghost.imageUrl) return ghost.imageUrl;
  return TEMP_IMAGES[index % TEMP_IMAGES.length];
};

// --- UTILS ---
const ScrambleText = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let i = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const interval = setInterval(() => {
      setDisplay(text.split("").map((_, index: number) => {
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

// Stat Bar Component
function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <div className="text-[10px] font-mono text-gray-500 tracking-[0.2em] group-hover:text-white transition-colors">{label}</div>
        <div className="text-xl font-['Oswald'] leading-none text-white">{value}%</div>
      </div>
      <div className="h-1 w-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full bg-red-600 shadow-[0_0_10px_red]"
        />
      </div>
    </div>
  );
}

export default function GhostsPage() {
  const { isAuthenticated } = useAuth();
  const [ghosts, setGhosts] = useState<GhostEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const carouselRef = useRef<HTMLDivElement>(null);
  const lastNavTime = useRef(0);

  const { isConnected } = useGamepad();

  useEffect(() => {
    loadGhosts();
  }, []);

  const loadGhosts = async () => {
    try {
      setLoading(true);
      const response = await ghostsApi.search({ page: 1, limit: 50 });
      if (Array.isArray(response)) {
        setGhosts(response);
      } else {
        setGhosts(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load ghosts:", error);
      setGhosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Gamepad controls
  useEffect(() => {
    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0];
      if (!gp || ghosts.length === 0) return;

      const now = Date.now();
      if (now - lastNavTime.current < 150) return;

      const left = gp.buttons[14]?.pressed || gp.axes[0] < -0.5;
      const right = gp.buttons[15]?.pressed || gp.axes[0] > 0.5;
      const cross = gp.buttons[0]?.pressed;
      const circle = gp.buttons[1]?.pressed;

      if (!isDetailsOpen) {
        if (left) {
          setSelectedIndex(prev => Math.max(0, prev - 1));
          lastNavTime.current = now;
        } else if (right) {
          setSelectedIndex(prev => Math.min(ghosts.length - 1, prev + 1));
          lastNavTime.current = now;
        } else if (cross) {
          setIsDetailsOpen(true);
          lastNavTime.current = now;
        }
      } else {
        if (circle) {
          setIsDetailsOpen(false);
          lastNavTime.current = now;
        }
      }
    };

    const interval = setInterval(handleGamepadInput, 16);
    return () => clearInterval(interval);
  }, [isDetailsOpen, ghosts.length]);

  // Scroll carousel when index changes
  useEffect(() => {
    if (carouselRef.current && ghosts.length > 0) {
      const centerOffset = window.innerWidth / 2 - 150;
      const scrollPos = (selectedIndex * 320) - centerOffset + 160;
      carouselRef.current.scrollTo({
        left: scrollPos,
        behavior: "smooth"
      });
    }
  }, [selectedIndex, ghosts.length]);

  const filteredGhosts = ghosts.filter(ghost =>
    ghost.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ghost.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGhost = filteredGhosts[selectedIndex];

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center">
        <div className="relative">
          <Ghost size={64} className="text-white/20 animate-pulse" />
          <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
        </div>
        <p className="font-mono text-sm text-gray-500 mt-6 tracking-widest animate-pulse">
          SCANNING_DATABASE...
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-[#050505] overflow-hidden text-white font-sans selection:bg-red-500/30">
      {/* GLOBAL FONTS & STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;400;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
        
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- CINEMATIC OVERLAY --- */}
      <div className="fixed inset-0 pointer-events-none z-[9000]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.02]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-[0.1]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,#000000_100%)] opacity-80" />
      </div>

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#050505] to-red-900/20 transition-colors duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-['Oswald'] font-bold text-white/[0.03] leading-none select-none pointer-events-none whitespace-nowrap blur-sm">
          ARCHIVE
        </div>
      </div>

      {/* --- TOP BAR --- */}
      <div className="absolute top-0 left-0 w-full p-8 md:px-12 flex justify-between items-center z-20 border-b border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 text-red-600 hover:text-white transition-colors group">
            <Ghost size={24} />
            <span className="text-2xl font-['Oswald'] font-bold tracking-tighter text-white group-hover:text-red-500 transition-colors">GHOSTPEDIA</span>
          </Link>
          <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
          <div className="hidden md:flex gap-8 text-xs font-mono tracking-[0.2em] text-gray-500">
            <span className="text-white">Archive //</span>
            <span className="text-gray-500">{filteredGhosts.length} ENTITIES</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 flex items-center gap-3 group hover:border-white/30 transition-colors">
            <Search size={14} className="text-gray-500 group-hover:text-white" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="SEARCH_DATABASE"
              className="bg-transparent text-[10px] font-mono tracking-widest text-white placeholder:text-gray-500 focus:outline-none w-32"
            />
          </div>
          {isAuthenticated && (
            <Link
              href="/ghosts/create"
              className="bg-white text-black px-4 py-2 flex items-center gap-2 font-mono text-[10px] tracking-widest hover:bg-gray-200 transition-colors"
            >
              <Plus size={12} />
              NEW_ENTITY
            </Link>
          )}
        </div>
      </div>

      {/* --- EMPTY STATE --- */}
      {filteredGhosts.length === 0 && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <Ghost size={64} className="text-white/20 mb-6" />
          <h2 className="text-3xl font-['Oswald'] uppercase tracking-wider mb-2">No Entities Found</h2>
          <p className="font-mono text-sm text-gray-500 tracking-wider mb-8">
            // DATABASE_EMPTY_OR_FILTERED
          </p>
          {isAuthenticated && (
            <Link
              href="/ghosts/create"
              className="flex items-center gap-3 px-8 py-4 bg-white text-black font-mono font-bold tracking-widest hover:bg-gray-200 transition-all"
            >
              <Plus size={16} />
              CREATE_FIRST_ENTITY
            </Link>
          )}
        </div>
      )}

      {/* --- MAIN CONTENT (List Mode) --- */}
      {filteredGhosts.length > 0 && (
        <div
          className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center pt-32 transition-all duration-700 transform ${isDetailsOpen ? "scale-90 opacity-0 pointer-events-none blur-sm" : "scale-100 opacity-100 blur-0"} z-10`}
        >
          <div className="pl-[10vw] mb-12 border-l-4 border-white/20 ml-[10vw]">
            <h2 className="text-6xl md:text-8xl font-['Oswald'] uppercase mb-2 leading-none">
              <ScrambleText text={selectedGhost?.name || "UNKNOWN"} />
            </h2>
            <div className="flex items-center gap-6 text-sm font-mono tracking-[0.3em] text-gray-400 uppercase">
              <span className="text-white bg-red-900/50 border border-red-500/50 px-2 py-0.5">
                Type: {selectedGhost?.type || "UNKNOWN"}
              </span>
              <span>ID: {selectedGhost?.id?.slice(0, 8).toUpperCase() || "---"}</span>
              <span className="flex items-center gap-1">
                <AlertTriangle size={12} className="text-red-500" />
                DANGER: {selectedGhost?.dangerLevel || 0}/5
              </span>
            </div>
          </div>

          {/* CAROUSEL */}
          <div
            ref={carouselRef}
            className="flex gap-12 overflow-x-auto px-[10vw] py-12 hide-scroll no-scrollbar scroll-smooth items-center"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredGhosts.map((ghost, idx) => (
              <motion.div
                key={ghost.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  setIsDetailsOpen(true);
                }}
                animate={{
                  scale: selectedIndex === idx ? 1.1 : 0.9,
                  opacity: selectedIndex === idx ? 1 : 0.4,
                  filter: selectedIndex === idx ? "grayscale(0%)" : "grayscale(100%)",
                }}
                className={`
                  relative flex-shrink-0 w-72 h-[450px] bg-black/40 border border-white/10 backdrop-blur-sm cursor-pointer
                  transition-all duration-300 group overflow-hidden
                  ${selectedIndex === idx ? "border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]" : "hover:border-white/40"}
                `}
              >
                {/* Scan Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/50 shadow-[0_0_20px_white] animate-[scan_3s_linear_infinite] opacity-0 group-hover:opacity-100 z-20 pointer-events-none" />

                {/* Image */}
                <div className="w-full h-3/4 p-8 flex items-center justify-center relative z-10 bg-gradient-to-b from-transparent to-black/50">
                  <img
                    src={getGhostImage(ghost, idx)}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                    alt={ghost.name}
                    onError={(e) => {
                      e.currentTarget.src = TEMP_IMAGES[idx % TEMP_IMAGES.length];
                    }}
                  />
                </div>

                {/* Card Info */}
                <div className="absolute bottom-0 left-0 w-full h-1/4 bg-white/5 border-t border-white/10 p-4 flex flex-col justify-center z-10">
                  <div className="text-[10px] font-mono tracking-widest text-red-500 mb-1">
                    THREAT: {(ghost.dangerLevel || 1) * 20}%
                  </div>
                  <div className="font-['Oswald'] uppercase text-2xl leading-none">{ghost.name}</div>
                  <div className="text-[10px] font-mono text-gray-500 mt-1">{ghost.origin}</div>
                </div>
              </motion.div>
            ))}
            {/* Paddle Spacer */}
            <div className="w-[50vw] flex-shrink-0" />
          </div>

          <div className="absolute bottom-12 left-24 flex items-center gap-4 text-[10px] font-mono text-gray-500">
            <div className="w-12 h-[1px] bg-gray-500" />
            SCROLL TO NAVIGATE DATABASE
          </div>
        </div>
      )}

      {/* --- DETAIL VIEW (Overlay) --- */}
      <AnimatePresence>
        {isDetailsOpen && selectedGhost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex bg-black/95 backdrop-blur-xl overflow-hidden"
          >
            {/* Hero Image */}
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute right-[-10%] top-0 h-full w-[70%] z-0 pointer-events-none opacity-60 mix-blend-screen"
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black to-black z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black z-10" />
                <img
                  src={getGhostImage(selectedGhost, selectedIndex)}
                  className="w-full h-full object-cover object-center opacity-80"
                  alt={selectedGhost.name}
                  onError={(e) => {
                    e.currentTarget.src = TEMP_IMAGES[selectedIndex % TEMP_IMAGES.length];
                  }}
                />
              </div>
            </motion.div>

            {/* Content */}
            <div className="relative w-full md:w-[60%] p-12 pl-[8vw] pr-12 flex flex-col justify-center z-10 h-full overflow-y-auto hide-scroll">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-[1px] w-12 bg-red-600" />
                  <span className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase">
                    Threat Level: {(selectedGhost.dangerLevel || 1) * 20}%
                  </span>
                </div>

                <h1 className="text-7xl md:text-9xl font-['Oswald'] font-bold uppercase mb-8 leading-none tracking-tighter text-white drop-shadow-2xl">
                  {selectedGhost.name}
                </h1>

                <div className="border-l-2 border-red-600/50 pl-8 mb-12 max-w-2xl bg-gradient-to-r from-red-900/10 to-transparent p-4">
                  <p className="text-xl md:text-2xl text-gray-300 font-['Rajdhani'] leading-relaxed font-light">
                    {selectedGhost.description}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-2xl">
                  <div className="bg-white/5 border border-white/10 p-4">
                    <div className="text-[10px] font-mono text-gray-500 tracking-widest mb-1">TYPE</div>
                    <div className="font-['Oswald'] text-lg uppercase">{selectedGhost.type}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4">
                    <div className="text-[10px] font-mono text-gray-500 tracking-widest mb-1">ORIGIN</div>
                    <div className="font-['Oswald'] text-lg uppercase">{selectedGhost.origin || "Unknown"}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4">
                    <div className="text-[10px] font-mono text-gray-500 tracking-widest mb-1">CULTURE</div>
                    <div className="font-['Oswald'] text-lg uppercase">{selectedGhost.culturalContext || "Various"}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4">
                    <div className="text-[10px] font-mono text-gray-500 tracking-widest mb-1">DANGER</div>
                    <div className="font-['Oswald'] text-lg uppercase text-red-500">{selectedGhost.dangerLevel}/5</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 max-w-2xl">
                  <StatBar label="AGGRESSION" value={(selectedGhost.dangerLevel || 1) * 20} />
                  <StatBar label="STEALTH" value={Math.min(100, 100 - (selectedGhost.dangerLevel || 1) * 15)} />
                  <StatBar label="ACTIVITY" value={50 + Math.random() * 50} />
                </div>

                {/* Characteristics */}
                {selectedGhost.characteristics && selectedGhost.characteristics.length > 0 && (
                  <div className="mb-12 max-w-2xl">
                    <div className="text-[10px] font-mono text-gray-500 mb-4 tracking-widest uppercase">
                      Known_Characteristics
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedGhost.characteristics.map((char, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/5 border border-white/10 font-mono text-xs tracking-wider"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Link
                    href={`/ghosts/${selectedGhost.id}`}
                    className="flex items-center gap-3 px-6 py-3 bg-white text-black font-mono text-xs tracking-widest hover:bg-gray-200 transition-colors"
                  >
                    <BookOpen size={14} />
                    VIEW_FULL_FILE
                  </Link>
                  
                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="flex items-center gap-3 text-xs font-mono tracking-widest text-white/50 hover:text-white transition-colors uppercase group"
                  >
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-500/10 transition-colors">
                      <ChevronLeft size={12} />
                    </div>
                    RETURN_TO_ARCHIVE
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- GAMEPAD CONTROLS HINT --- */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-12 right-12 flex gap-8 text-xs font-mono text-gray-500 z-40 border px-6 py-3 border-white/10 bg-black/80 backdrop-blur rounded-full"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center text-[8px] text-white bg-white/10">✕</span>
              <span className="tracking-widest text-gray-400">{isDetailsOpen ? "VIEW" : "SELECT"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center text-[8px] text-white bg-white/10">○</span>
              <span className="tracking-widest text-gray-400">BACK</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
