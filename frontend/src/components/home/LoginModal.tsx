"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Key, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-black border border-white/20 p-8 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-2 mb-8 justify-center text-red-500">
              <Lock size={16} />
              <span className="font-mono text-xs tracking-widest">SECURE_LOGIN_REQUIRED</span>
            </div>

            <h2 className="text-3xl font-['Oswald'] font-bold text-center mb-8 uppercase text-white">Agent Authentication</h2>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-500 block">AGENT_ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input type="text" className="w-full bg-white/5 border border-white/10 p-3 pl-10 text-white focus:border-red-500 focus:outline-none transition-colors font-mono" placeholder="ID-XXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-500 block">PASSCODE</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input type="password" className="w-full bg-white/5 border border-white/10 p-3 pl-10 text-white focus:border-red-500 focus:outline-none transition-colors font-mono" placeholder="••••••••" />
                </div>
              </div>
              
              <button type="button" className="w-full bg-white text-black font-bold py-4 hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm mt-4">
                Authenticate
              </button>
            </form>

            <div className="mt-6 text-center text-[10px] text-gray-600 font-mono">
              UNAUTHORIZED ACCESS IS A CLASS A FELONY
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
