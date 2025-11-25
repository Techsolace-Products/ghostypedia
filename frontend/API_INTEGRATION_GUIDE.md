# Frontend API Integration Guide

## Overview

All backend APIs from `backend/API_DOCUMENTATION.md` have been integrated into the frontend with a clean, type-safe structure.

## File Structure

```
frontend/src/lib/api/
├── client.ts              # Base API client with auth token injection
├── auth.ts                # ✅ Authentication APIs (already working)
├── user.ts                # User profile & preferences
├── ghosts.ts              # Ghost entities search & details
├── stories.ts             # Stories & reading progress
├── bookmarks.ts           # Bookmark management
├── recommendations.ts     # Personalized recommendations
├── digitalTwin.ts         # AI chat interface
└── index.ts               # Export all APIs
```

## Usage Examples

### 1. Authentication (Already Working)

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Login
  await login({ email, password });
  
  // Logout
  await logout();
}
```

### 2. User Profile & Preferences

```tsx
import { userApi } from '@/lib/api';

// Get user profile
const profile = await userApi.getProfile(userId);

// Get preferences
const prefs = await userApi.getPreferences(userId);

// Update preferences
await userApi.updatePreferences(userId, {
  spookinessLevel: 4,
  favoriteGhostTypes: ['poltergeist', 'banshee'],
});
```

**Example Page**: `/preferences` - Full preferences management UI

### 3. Ghost Entities

```tsx
import { ghostsApi } from '@/lib/api';

// Search ghosts
const results = await ghostsApi.search({
  query: 'poltergeist',
  dangerLevel: 3,
  page: 1,
  limit: 20,
});

// Get specific ghost
const ghost = await ghostsApi.getById(ghostId);

// Get by category
const spirits = await ghostsApi.getByCategory('spirit');

// Get related ghosts
const related = await ghostsApi.getRelated(ghostId);
```

**Example Pages**:
- `/ghosts` - Browse all ghosts with pagination
- `/ghosts/[id]` - Ghost detail page with stories and bookmark

### 4. Stories

```tsx
import { storiesApi } from '@/lib/api';

// Get stories for a ghost
const stories = await storiesApi.getByGhost(ghostId);

// Get specific story
const story = await storiesApi.getById(storyId);

// Update reading progress
await storiesApi.updateProgress(storyId, {
  progressPercentage: 45.5,
  lastReadPosition: 1234,
});

// Mark as read
await storiesApi.markAsRead(storyId);
```

### 5. Bookmarks

```tsx
import { bookmarksApi } from '@/lib/api';

// Get all bookmarks
const bookmarks = await bookmarksApi.getAll();

// Create bookmark
await bookmarksApi.create({
  contentId: ghostId,
  contentType: 'ghost_entity',
  tags: ['favorite', 'research'],
  notes: 'Interesting ghost',
});

// Delete bookmark
await bookmarksApi.delete(bookmarkId);

// Update tags
await bookmarksApi.updateTags(bookmarkId, ['favorite', 'important']);
```

### 6. Recommendations

```tsx
import { recommendationsApi } from '@/lib/api';

// Get recommendations
const recommendations = await recommendationsApi.get(20);

// Record interaction
await recommendationsApi.recordInteraction({
  contentId: ghostId,
  contentType: 'ghost_entity',
  interactionType: 'view',
});

// Submit feedback
await recommendationsApi.submitFeedback(recommendationId, 'like');
```

### 7. Digital Twin (AI Chat)

```tsx
import { digitalTwinApi } from '@/lib/api';

// Send message
const response = await digitalTwinApi.sendMessage('Tell me about yokai');
// Returns: { response, contentReferences, responseTime }

// Get conversation history
const history = await digitalTwinApi.getHistory(50);
```

**Example Page**: `/twin` - Full AI chat interface with history

## API Client Features

### Automatic Token Injection

The API client automatically includes the auth token in all requests:

```typescript
// No need to manually add Authorization header
const ghost = await ghostsApi.getById(id); // Token added automatically
```

### Error Handling

All API calls throw typed errors:

```typescript
try {
  await ghostsApi.getById(id);
} catch (error) {
  const apiError = error as ApiError;
  console.error(apiError.message);
  // Handle specific error codes
  if (apiError.code === 'NOT_FOUND') {
    // Show 404 page
  }
}
```

### Type Safety

All APIs are fully typed with TypeScript:

```typescript
import type { GhostEntity, Story, Bookmark } from '@/lib/api';

const ghost: GhostEntity = await ghostsApi.getById(id);
// TypeScript knows all properties: name, type, dangerLevel, etc.
```

## Example Pages Created

1. **`/ghosts`** - Browse ghost entities with pagination
2. **`/ghosts/[id]`** - Ghost detail page with bookmark functionality
3. **`/preferences`** - User preferences management (protected)
4. **`/twin`** - AI chat interface (protected)

## Protected Routes

Use the `ProtectedRoute` component for authenticated pages:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}
```

## Next Steps

### To Add More Features:

1. **Bookmarks Page** - Create `/bookmarks` page to list all user bookmarks
2. **Recommendations Page** - Create `/recommendations` page to show personalized content
3. **Story Reader** - Create `/stories/[id]` page with reading progress tracking
4. **Search Page** - Create `/search` page with advanced ghost search filters
5. **User Profile** - Enhance `/dashboard` with profile editing

### Example: Create Bookmarks Page

```tsx
// frontend/src/app/bookmarks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { bookmarksApi, type Bookmark } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function BookmarksContent() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const data = await bookmarksApi.getAll();
    setBookmarks(data);
  };

  const handleDelete = async (id: string) => {
    await bookmarksApi.delete(id);
    loadBookmarks(); // Reload
  };

  return (
    <div>
      <h1>My Bookmarks</h1>
      {bookmarks.map(bookmark => (
        <div key={bookmark.id}>
          <p>{bookmark.contentType}: {bookmark.contentId}</p>
          <button onClick={() => handleDelete(bookmark.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <ProtectedRoute>
      <BookmarksContent />
    </ProtectedRoute>
  );
}
```

## API Base URL

Configured in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Summary

✅ **All APIs integrated** with type-safe wrappers  
✅ **Authentication working** with automatic token management  
✅ **Example pages created** showing real usage  
✅ **Protected routes** implemented  
✅ **Error handling** built-in  
✅ **TypeScript types** for all responses  

The API integration is complete and ready to use. Just import the API modules and call the methods!
