'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, Plus, Skull, AlertTriangle, Globe, Sparkles, Image, Dice6, X } from 'lucide-react';
import { ghostsApi, type CreateGhostData } from '@/lib/api';
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

const DangerMeter = ({ level, onChange }: { level: number; onChange: (level: number) => void }) => {
  const labels = ['HARMLESS', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'];
  const colors = ['text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500', 'text-red-700'];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-gray-400 tracking-wider">THREAT_LEVEL:</span>
        <span className={`font-mono text-lg font-bold ${colors[level - 1]}`}>
          {level} - {labels[level - 1]}
        </span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`flex-1 h-8 transition-all ${
              i <= level 
                ? i <= 2 ? 'bg-green-500' : i <= 3 ? 'bg-yellow-500' : i <= 4 ? 'bg-red-500' : 'bg-red-700'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

function CreateGhostContent() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateGhostData>({
    name: '',
    type: '',
    description: '',
    origin: '',
    culturalContext: '',
    dangerLevel: 3,
    characteristics: [],
    tags: [],
    imageUrl: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [charInput, setCharInput] = useState('');

  const handleCreateGhost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      const data: CreateGhostData = {
        ...formData,
        characteristics: formData.characteristics?.length ? formData.characteristics : [],
        tags: formData.tags?.length ? formData.tags : [],
      };

      const response = await ghostsApi.create(data);
      alert(response.message || 'Entity cataloged successfully!');
      router.push('/ghosts');
    } catch (error) {
      console.error('Failed to create ghost:', error);
      alert('Failed to catalog entity. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const fillSampleData = () => {
    setFormData({
      name: 'Banshee',
      type: 'spirit',
      description: 'A female spirit in Irish mythology who heralds the death of a family member, usually by wailing, shrieking, or keening. Her appearance varies from a young woman to an old hag.',
      origin: 'Irish mythology',
      culturalContext: 'Celtic',
      dangerLevel: 3,
      characteristics: ['wailing', 'omen of death', 'female', 'translucent'],
      tags: ['irish', 'celtic', 'death', 'folklore'],
      imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400',
    });
  };

  const addTag = (value: string, field: 'tags' | 'characteristics') => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] || []), value.trim()]
      });
      if (field === 'tags') setTagInput('');
      else setCharInput('');
    }
  };

  const removeTag = (index: number, field: 'tags' | 'characteristics') => {
    setFormData({
      ...formData,
      [field]: formData[field]?.filter((_, i) => i !== index)
    });
  };

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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeader title="New Entity" sub="CATALOG_NEW_PARANORMAL_SUBJECT" />
          
          <button
            type="button"
            onClick={fillSampleData}
            className="flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 font-mono text-sm tracking-widest hover:bg-white/10 transition-all self-start"
          >
            <Dice6 size={14} />
            SAMPLE_DATA
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateGhost} className="space-y-6">
          {/* Basic Information */}
          <FormSection icon={Skull} title="Entity Identification">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2">
                  ENTITY_NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 font-['Rajdhani'] text-lg tracking-wide placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., Banshee, Poltergeist"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2">
                  ENTITY_TYPE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 font-['Rajdhani'] text-lg tracking-wide placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., spirit, demon, yokai"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2">
                DESCRIPTION <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 font-['Rajdhani'] tracking-wide placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all resize-none"
                placeholder="Detailed description of the entity..."
              />
              <p className="font-mono text-xs text-gray-600 mt-2">
                CHAR_COUNT: <span className="text-gray-400">{formData.description.length}</span>
              </p>
            </div>
          </FormSection>

          {/* Cultural Background */}
          <FormSection icon={Globe} title="Cultural Origin">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2">
                  ORIGIN
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 font-['Rajdhani'] text-lg tracking-wide placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., Irish mythology"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2">
                  CULTURAL_CONTEXT
                </label>
                <input
                  type="text"
                  value={formData.culturalContext}
                  onChange={(e) => setFormData({ ...formData, culturalContext: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 font-['Rajdhani'] text-lg tracking-wide placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., Celtic, Japanese"
                />
              </div>
            </div>
          </FormSection>

          {/* Danger Level */}
          <FormSection icon={AlertTriangle} title="Threat Assessment">
            <DangerMeter
              level={formData.dangerLevel || 3}
              onChange={(level) => setFormData({ ...formData, dangerLevel: level })}
            />
          </FormSection>

          {/* Attributes & Tags */}
          <FormSection icon={Sparkles} title="Attributes & Classification">
            {/* Characteristics */}
            <div>
              <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2">
                CHARACTERISTICS
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={charInput}
                  onChange={(e) => setCharInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(charInput, 'characteristics');
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 font-['Rajdhani'] tracking-wide placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., wailing, translucent"
                />
                <button
                  type="button"
                  onClick={() => addTag(charInput, 'characteristics')}
                  className="px-6 py-3 bg-white text-black font-mono text-sm tracking-widest hover:bg-gray-200 transition-all"
                >
                  ADD
                </button>
              </div>
              {formData.characteristics && formData.characteristics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.characteristics.map((char, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/30 text-sm font-mono text-red-400"
                    >
                      {char}
                      <button
                        type="button"
                        onClick={() => removeTag(idx, 'characteristics')}
                        className="hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block font-mono text-xs text-gray-500 tracking-widest mb-2">
                CLASSIFICATION_TAGS
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput, 'tags');
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 font-['Rajdhani'] tracking-wide placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                  placeholder="e.g., irish, folklore"
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput, 'tags')}
                  className="px-6 py-3 bg-white/10 border border-white/20 font-mono text-sm tracking-widest hover:bg-white/20 transition-all"
                >
                  ADD
                </button>
              </div>
              <p className="font-mono text-xs text-gray-600 mt-2">
                // TAGS_IMPROVE_RECOMMENDATIONS
              </p>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-sm font-mono text-gray-400"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(idx, 'tags')}
                        className="hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          {/* Image */}
          <FormSection icon={Image} title="Visual Documentation">
            <div className="flex gap-3 mb-4">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-mono text-sm tracking-widest hover:bg-gray-200 transition-all">
                  <Image size={16} />
                  UPLOAD_IMAGE
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              
              <button
                type="button"
                onClick={() => {
                  const randomImages = [
                    'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400',
                    'https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?w=400',
                    'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=400',
                  ];
                  setFormData({ ...formData, imageUrl: randomImages[Math.floor(Math.random() * randomImages.length)] });
                }}
                className="px-6 py-3 border border-white/20 bg-white/5 font-mono text-sm tracking-widest hover:bg-white/10 transition-all"
              >
                <Dice6 size={16} />
              </button>
            </div>

            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 font-mono text-sm tracking-wide placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
              placeholder="Or paste image URL..."
            />

            {formData.imageUrl && (
              <div className="mt-6 border border-white/10 p-4">
                <p className="font-mono text-xs text-gray-500 tracking-widest mb-4">PREVIEW:</p>
                <div className="relative">
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23111" width="400" height="300"/%3E%3Ctext fill="%23444" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="monospace"%3EIMAGE_FAILED%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>
              </div>
            )}
          </FormSection>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-mono font-bold tracking-widest hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  CATALOGING...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  CATALOG_ENTITY
                </>
              )}
            </button>
            <Link
              href="/ghosts"
              className="px-8 py-4 border border-white/20 bg-white/5 font-mono tracking-widest hover:bg-white/10 transition-all flex items-center justify-center"
            >
              CANCEL
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateGhostPage() {
  return (
    <ProtectedRoute>
      <CreateGhostContent />
    </ProtectedRoute>
  );
}
