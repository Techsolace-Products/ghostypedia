'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, Settings, Bell, Ghost, Sparkles, Save, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { userApi, type UserPreferencesFlat } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

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

const FormSection = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="border border-white/10 bg-black/30 p-6 md:p-8 space-y-6">
    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
      <Icon size={20} className="text-red-500" />
      <h2 className="font-['Oswald'] text-xl uppercase tracking-wider">{title}</h2>
    </div>
    {children}
  </div>
);

const SpookinessMeter = ({ level, onChange }: { level: number; onChange: (level: number) => void }) => {
  const labels = ['MILD', 'CREEPY', 'SCARY', 'TERRIFYING', 'NIGHTMARE'];
  const emojis = ['😊', '😰', '😱', '💀', '👻'];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-gray-400 tracking-wider">SPOOKINESS_LEVEL:</span>
        <span className="font-mono text-lg font-bold text-red-400">
          {emojis[level - 1]} {labels[level - 1]}
        </span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`flex-1 h-10 transition-all flex items-center justify-center font-mono text-sm ${
              i <= level 
                ? 'bg-red-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-500'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between font-mono text-[10px] text-gray-600 tracking-wider">
        <span>MILD</span>
        <span>NIGHTMARE</span>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <span className="font-mono text-sm text-gray-400 tracking-wider group-hover:text-white transition-colors">
      {label}
    </span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-7 rounded-none transition-colors ${
        checked ? 'bg-red-600' : 'bg-white/10'
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white transition-all ${
          checked ? 'left-8' : 'left-1'
        }`}
      />
    </button>
  </label>
);

function PreferencesContent() {
  const { user, isLoading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferencesFlat | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const loadPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const prefs = await userApi.getPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !preferences) return;
    
    try {
      setSaving(true);
      await userApi.updatePreferences(user.id, preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="relative">
          <Settings size={48} className="text-white/20 animate-spin" />
          <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
        </div>
        <p className="font-mono text-sm text-gray-500 mt-6 tracking-widest animate-pulse">
          LOADING_PREFERENCES...
        </p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <Settings size={64} className="text-white/20 mb-6" />
        <h1 className="font-['Oswald'] text-3xl uppercase tracking-wider mb-2">Preferences Unavailable</h1>
        <p className="font-mono text-sm text-gray-500 tracking-wider mb-8">// FAILED_TO_LOAD_CONFIG</p>
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

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-12">
        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm tracking-widest mb-8 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          RETURN_TO_HQ
        </Link>

        {/* Header */}
        <SectionHeader title="Preferences" sub="AGENT_CONFIGURATION" />

        {/* Form */}
        <div className="space-y-6">
          {/* Spookiness Level */}
          <FormSection icon={Ghost} title="Content Intensity">
            <SpookinessMeter
              level={preferences.spookinessLevel}
              onChange={(level) => setPreferences({ ...preferences, spookinessLevel: level })}
            />
            <p className="font-mono text-xs text-gray-600 tracking-wider">
              // ADJUSTS_CONTENT_RECOMMENDATIONS_BASED_ON_FEAR_TOLERANCE
            </p>
          </FormSection>

          {/* Favorite Ghost Types */}
          <FormSection icon={Sparkles} title="Preferred Entity Types">
            <div className="space-y-4">
              <p className="font-mono text-xs text-gray-500 tracking-wider mb-4">
                SELECT_GHOST_TYPES_FOR_PERSONALIZED_RECOMMENDATIONS
              </p>
              <div className="flex flex-wrap gap-2">
                {['spirit', 'demon', 'poltergeist', 'yokai', 'apparition', 'wraith', 'phantom', 'specter'].map((type) => {
                  const isSelected = preferences.favoriteGhostTypes?.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const current = preferences.favoriteGhostTypes || [];
                        setPreferences({
                          ...preferences,
                          favoriteGhostTypes: isSelected
                            ? current.filter(t => t !== type)
                            : [...current, type]
                        });
                      }}
                      className={`px-4 py-2 font-mono text-sm tracking-wider transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </FormSection>

          {/* Notifications */}
          <FormSection icon={Bell} title="Notification Settings">
            <div className="space-y-4">
              <ToggleSwitch
                checked={preferences.emailNotifications ?? false}
                onChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                label="EMAIL_NOTIFICATIONS"
              />
              <ToggleSwitch
                checked={preferences.recommendationAlerts ?? false}
                onChange={(checked) => setPreferences({ ...preferences, recommendationAlerts: checked })}
                label="RECOMMENDATION_ALERTS"
              />
            </div>
          </FormSection>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full flex items-center justify-center gap-3 px-8 py-4 font-mono font-bold tracking-widest transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-white text-black hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                SAVING...
              </>
            ) : saved ? (
              <>
                <Check size={18} />
                SAVED_SUCCESSFULLY
              </>
            ) : (
              <>
                <Save size={18} />
                SAVE_PREFERENCES
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-8 font-mono text-xs text-gray-600 tracking-widest">
            <span>AGENT: <span className="text-gray-400">{user?.username?.toUpperCase()}</span></span>
            <span>CONFIG_STATUS: <span className="text-green-500">SYNCED</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <ProtectedRoute>
      <PreferencesContent />
    </ProtectedRoute>
  );
}
