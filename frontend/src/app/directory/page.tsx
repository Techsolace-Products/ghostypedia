"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, ChevronRight, X, Play,
    Gamepad2, Search, Filter, Info, Star, Ghost
} from "lucide-react";
import { useGamepad } from "@/hooks/useGamepad";
import { MOCK_GHOSTS, Ghost as GhostType } from "@/data/mockGhosts";
import Link from "next/link";

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

export default function DirectoryPage() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Ref for the scroll container
    const carouselRef = useRef<HTMLDivElement>(null);
    const lastNavTime = useRef(0);

    // Use the hook to detect connection status
    const { isConnected } = useGamepad();

    // Custom Gamepad Loop
    useEffect(() => {
        const handleGamepadInput = () => {
            const gamepads = navigator.getGamepads();
            const gp = gamepads[0];
            if (!gp) return;

            const now = Date.now();
            if (now - lastNavTime.current < 150) return;

            // Navigation (D-Pad or Stick)
            const left = gp.buttons[14]?.pressed || gp.axes[0] < -0.5;
            const right = gp.buttons[15]?.pressed || gp.axes[0] > 0.5;
            const cross = gp.buttons[0]?.pressed; // Select
            const circle = gp.buttons[1]?.pressed; // Back

            if (!isDetailsOpen) {
                if (left) {
                    setSelectedIndex(prev => Math.max(0, prev - 1));
                    lastNavTime.current = now;
                } else if (right) {
                    setSelectedIndex(prev => Math.min(MOCK_GHOSTS.length - 1, prev + 1));
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
    }, [isDetailsOpen]);

    // Scroll carousel when index changes
    useEffect(() => {
        if (carouselRef.current) {
            // Center the selected item
            const centerOffset = window.innerWidth / 2 - 150;
            const scrollPos = (selectedIndex * 320) - centerOffset + 160;
            carouselRef.current.scrollTo({
                left: scrollPos,
                behavior: 'smooth'
            });
        }
    }, [selectedIndex]);

    const selectedGhost = MOCK_GHOSTS[selectedIndex];

    return (
        <div className="relative h-screen w-full bg-[#050505] overflow-hidden text-white font-sans selection:bg-red-500/30">

            {/* GLOBAL FONTS & STYLES */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;400;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
        
        /* Scan Effect Animation */
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
                {/* Dynamic Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-[#050505] via-[#050505] to-${selectedGhost.dangerLevel > 70 ? 'red' : 'blue'}-900/20 transition-colors duration-1000`} />

                {/* Large Faded Text Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-['Oswald'] font-bold text-white/[0.03] leading-none select-none pointer-events-none whitespace-nowrap blur-sm">
                    ARCHIVE
                </div>
            </div>

            {/* --- TOP BAR --- */}
            <div className="absolute top-0 left-0 w-full p-8 md:px-12 flex justify-between items-center z-20 border-b border-white/5 bg-black/50 backdrop-blur-sm">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-3 text-red-600 hover:text-white transition-colors group">
                        <Ghost size={24} />
                        <span className="text-2xl font-['Oswald'] font-bold tracking-tighter text-white group-hover:text-red-500 transition-colors">GHOSTPEDIA</span>
                    </Link>
                    <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
                    <div className="hidden md:flex gap-8 text-xs font-mono tracking-[0.2em] text-gray-500">
                        <span className="text-white">Directory //</span>
                        <span className="hover:text-white cursor-pointer transition-colors">CLASSIFIED_FILES</span>
                        <span className="hover:text-white cursor-pointer transition-colors">EVIDENCE_LOGS</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 flex items-center gap-3 group hover:border-white/30 transition-colors">
                        <Search size={14} className="text-gray-500 group-hover:text-white" />
                        <span className="text-[10px] font-mono tracking-widest text-gray-500 group-hover:text-white">SEARCH_DATABASE</span>
                    </div>
                    {isConnected && (
                        <div className="text-[10px] font-mono text-green-500 flex items-center gap-2 border border-green-500/30 px-3 py-2 bg-green-500/10">
                            <Gamepad2 size={12} /> SYSTEM_LINKED
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN CONTENT (List Mode) --- */}
            <div
                className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center pt-32 transition-all duration-700 transform ${isDetailsOpen ? 'scale-90 opacity-0 pointer-events-none blur-sm' : 'scale-100 opacity-100 blur-0'} z-10`}
            >
                <div className="pl-[10vw] mb-12 border-l-4 border-white/20 ml-[10vw]">
                    <h2 className="text-6xl md:text-8xl font-['Oswald'] uppercase mb-2 leading-none">
                        <ScrambleText text={selectedGhost.name} />
                    </h2>
                    <div className="flex items-center gap-6 text-sm font-mono tracking-[0.3em] text-gray-400 uppercase">
                        <span className="text-white bg-red-900/50 border border-red-500/50 px-2 py-0.5">Class: {selectedGhost.category}</span>
                        <span>ID: {selectedGhost.id}</span>
                    </div>
                </div>

                {/* CAROUSEL */}
                <div
                    ref={carouselRef}
                    className="flex gap-12 overflow-x-auto px-[10vw] py-12 hide-scroll no-scrollbar scroll-smooth items-center"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {MOCK_GHOSTS.map((ghost, idx) => (
                        <motion.div
                            key={ghost.id}
                            onClick={() => {
                                setSelectedIndex(idx);
                                setIsDetailsOpen(true);
                            }}
                            animate={{
                                scale: selectedIndex === idx ? 1.1 : 0.9,
                                opacity: selectedIndex === idx ? 1 : 0.4,
                                filter: selectedIndex === idx ? 'grayscale(0%)' : 'grayscale(100%)',
                            }}
                            className={`
                        relative flex-shrink-0 w-72 h-[450px] bg-black/40 border border-white/10 backdrop-blur-sm cursor-pointer
                        transition-all duration-300 group overflow-hidden
                        ${selectedIndex === idx ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'hover:border-white/40'}
                    `}
                        >
                            {/* Scan Effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/50 shadow-[0_0_20px_white] animate-[scan_3s_linear_infinite] opacity-0 group-hover:opacity-100 z-20 pointer-events-none" />

                            {/* Image */}
                            <div className="w-full h-3/4 p-8 flex items-center justify-center relative z-10">
                                <img src={ghost.imageUrl} className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" alt={ghost.name} />
                            </div>

                            {/* Card Info */}
                            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-white/5 border-t border-white/10 p-4 flex flex-col justify-center z-10">
                                <div className="text-[10px] font-mono tracking-widest text-red-500 mb-1">THREAT: {ghost.dangerLevel}%</div>
                                <div className="font-['Oswald'] uppercase text-2xl leading-none">{ghost.name}</div>
                            </div>
                        </motion.div>
                    ))}
                    {/* Paddle Spacer */}
                    <div className="w-[50vw] flex-shrink-0" />
                </div>
            </div>

            {/* --- DETAIL VIEW (Overlay) --- */}
            <AnimatePresence>
                {isDetailsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 flex bg-black/95 backdrop-blur-xl overflow-hidden"
                    >
                        {/* Hero Image (Absolute Background/Right) */}
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
                                    src={selectedGhost.imageUrl}
                                    className="w-full h-full object-cover object-center opacity-80"
                                    alt={selectedGhost.name}
                                />
                            </div>
                        </motion.div>

                        {/* Content (Left) - Added hide-scroll class */}
                        <div className="relative w-full md:w-[60%] p-12 pl-[8vw] pr-12 flex flex-col justify-center z-10 h-full overflow-y-auto hide-scroll">
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-[1px] w-12 bg-red-600"></div>
                                    <span className="text-red-500 font-mono text-xs tracking-[0.3em] uppercase">
                                        Threat Level: {selectedGhost.dangerLevel}%
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

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 max-w-2xl">
                                    <StatBar label="STRENGTH" value={selectedGhost.stats.strength} />
                                    <StatBar label="SPEED" value={selectedGhost.stats.speed} />
                                    <StatBar label="STEALTH" value={selectedGhost.stats.stealth} />
                                </div>

                                {/* EVIDENCE LOG */}
                                <div className="mb-12">
                                    <div className="text-[10px] font-mono text-gray-500 mb-6 tracking-widest uppercase border-b border-white/10 pb-2 w-full max-w-xl flex justify-between">
                                        <span>Evidence_Log_00{selectedIndex + 1}</span>
                                        <span className="text-red-500">ENCRYPTED_SIGNAL_DETECTED</span>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start gap-8">
                                        {/* Video Thumbnail Card */}
                                        <a
                                            href={selectedGhost.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative group w-72 h-40 bg-black border border-white/10 overflow-hidden shrink-0 shadow-2xl hover:border-red-500/50 transition-colors"
                                        >
                                            {selectedGhost.videoThumbnail ? (
                                                <img src={selectedGhost.videoThumbnail} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="Evidence" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-600">NO_DATA</div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-white/10 p-4 rounded-full backdrop-blur-md group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300 border border-white/20">
                                                    <Play size={24} fill="white" className="text-white ml-1" />
                                                </div>
                                            </div>
                                            {/* Glitch Overlay */}
                                            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-[0.05] pointer-events-none mix-blend-overlay" />

                                            <div className="absolute bottom-0 w-full bg-black/80 px-3 py-1 text-[8px] font-mono text-gray-400 flex justify-between">
                                                <span>REC_00:14:22</span>
                                                <span className="text-red-500">LIVE_FEED</span>
                                            </div>
                                        </a>

                                        <div className="flex flex-col gap-6 pt-2">
                                            <div className="text-sm text-gray-400 font-['Rajdhani'] max-w-xs leading-snug">
                                                <span className="text-red-500 font-bold tracking-wider">WARNING:</span> Footage contains class {selectedGhost.dangerLevel} paranormal activity. Viewer discretion advised.
                                            </div>
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
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- FOOTER CONTROLS HINT --- */}
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
                            <span className="tracking-widest text-gray-400">{isDetailsOpen ? 'PLAY' : 'SELECT'}</span>
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

// Subcomponents
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
