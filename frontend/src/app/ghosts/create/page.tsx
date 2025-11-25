'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ghostsApi, type CreateGhostData } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

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
      
      // Show success message
      alert(response.message || 'Ghost created successfully!');
      
      // Redirect to ghosts list
      router.push('/ghosts');
    } catch (error) {
      console.error('Failed to create ghost:', error);
      alert('Failed to create ghost. Please try again.');
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
    setTagInput('');
    setCharInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/ghosts"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Ghosts
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-5xl">👻</span>
                Create New Ghost
              </h1>
              <p className="text-gray-600 mt-2">Add a new paranormal entity to the encyclopedia</p>
            </div>
            <button
              type="button"
              onClick={fillSampleData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <span>🎲</span>
              Fill Sample Data
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateGhost} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
              <span className="text-2xl">📝</span>
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghost Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                  placeholder="e.g., Banshee, Poltergeist, Yurei"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Entity Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                  placeholder="e.g., spirit, demon, yokai"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-gray-900"
                placeholder="Provide a detailed description..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length} characters</p>
            </div>
          </div>

          {/* Cultural Background */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
              <span className="text-2xl">🌍</span>
              Cultural Background
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Origin</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                  placeholder="e.g., Irish mythology"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cultural Context</label>
                <input
                  type="text"
                  value={formData.culturalContext}
                  onChange={(e) => setFormData({ ...formData, culturalContext: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                  placeholder="e.g., Celtic, Japanese"
                />
              </div>
            </div>
          </div>

          {/* Danger Level */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
              <span className="text-2xl">⚠️</span>
              Threat Assessment
            </h2>
            
            <div className="bg-gradient-to-r from-green-50 to-red-50 p-6 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Danger Level: <span className="text-3xl font-bold text-purple-600">{formData.dangerLevel}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.dangerLevel}
                onChange={(e) => setFormData({ ...formData, dangerLevel: parseInt(e.target.value) })}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm font-medium mt-3">
                <span className="text-green-600">😊 Harmless</span>
                <span className="text-yellow-600">😐 Moderate</span>
                <span className="text-red-600">😱 Terrifying</span>
              </div>
            </div>
          </div>

          {/* Attributes & Tags */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
              <span className="text-2xl">✨</span>
              Attributes & Tags
            </h2>
            
            {/* Characteristics */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Characteristics</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={charInput}
                  onChange={(e) => setCharInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (charInput.trim()) {
                        setFormData({
                          ...formData,
                          characteristics: [...(formData.characteristics || []), charInput.trim()]
                        });
                        setCharInput('');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                  placeholder="e.g., wailing, omen of death"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (charInput.trim()) {
                      setFormData({
                        ...formData,
                        characteristics: [...(formData.characteristics || []), charInput.trim()]
                      });
                      setCharInput('');
                    }
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
                >
                  Add
                </button>
              </div>
              {formData.characteristics && formData.characteristics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.characteristics.map((char, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2">
                      {char}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            characteristics: formData.characteristics?.filter((_, i) => i !== idx)
                          });
                        }}
                        className="text-purple-500 hover:text-purple-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags (Added to your preferences)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tagInput.trim()) {
                        setFormData({
                          ...formData,
                          tags: [...(formData.tags || []), tagInput.trim()]
                        });
                        setTagInput('');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                  placeholder="e.g., irish, celtic, folklore"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tagInput.trim()) {
                      setFormData({
                        ...formData,
                        tags: [...(formData.tags || []), tagInput.trim()]
                      });
                      setTagInput('');
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-1 font-medium">
                🎯 These tags improve your recommendations!
              </p>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags?.filter((_, i) => i !== idx)
                          });
                        }}
                        className="text-blue-500 hover:text-blue-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
              <span className="text-2xl">🖼️</span>
              Visual Media
            </h2>
            
            <div className="flex gap-3 mb-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload Image
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
                  const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
                  setFormData({ ...formData, imageUrl: randomImage });
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                🎲 Random
              </button>
            </div>

            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
              placeholder="Or paste image URL..."
            />

            {formData.imageUrl && (
              <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Failed%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              {creating ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Ghost...
                </>
              ) : (
                <>
                  <span className="text-2xl">👻</span>
                  Create Ghost Entity
                </>
              )}
            </button>
            <Link
              href="/ghosts"
              className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all flex items-center justify-center"
            >
              Cancel
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
