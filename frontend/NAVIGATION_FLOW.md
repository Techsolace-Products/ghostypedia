# Ghostypedia Navigation Flow

## Complete User Journey

### 🏠 Landing Page (`/`)
**Public Access**
- Overview of Ghostypedia features
- Sign In / Sign Up buttons
- Browse Ghosts link (public access)

**Actions:**
- Click "Sign Up" → `/register`
- Click "Sign In" → `/login`
- Click "Browse Ghosts" → `/ghosts`

---

### 🔐 Authentication Flow

#### Register (`/register`)
1. Fill in email, username, password
2. Submit form
3. **Auto-redirect** → `/dashboard`

#### Login (`/login`)
1. Fill in email, password
2. Submit form
3. **Auto-redirect** → `/dashboard`

---

### 📊 Dashboard (`/dashboard`) 🔒
**Protected Route - Requires Login**

**Features Available:**
1. **👻 Browse Ghosts** → `/ghosts`
   - Search and explore ghost entities
   - View details, bookmark favorites

2. **🤖 AI Digital Twin** → `/twin`
   - Chat with AI about paranormal topics
   - Get personalized responses
   - View conversation history

3. **⚙️ Preferences** → `/preferences`
   - Set spookiness level (1-5)
   - Configure notifications
   - Customize experience

4. **🔖 Bookmarks** → `/bookmarks`
   - View saved ghosts and stories
   - Organize with tags
   - Delete bookmarks

5. **✨ Recommendations** → `/recommendations`
   - Get personalized content suggestions
   - Like/dislike recommendations
   - Improve AI suggestions

6. **📚 Stories** → `/stories`
   - Read ghost stories and legends
   - Track reading progress
   - Mark stories as completed

---

## Page-by-Page Navigation

### `/ghosts` - Ghost Encyclopedia
**Public Access**
- Browse all ghost entities
- Pagination (20 per page)
- Click any ghost → `/ghosts/[id]`

**Navigation:**
- Navbar: Home, AI Twin, Bookmarks, Preferences
- Back to Dashboard button

### `/ghosts/[id]` - Ghost Detail Page
**Public Access**
- View ghost details
- See characteristics, danger level
- View related stories
- **Bookmark button** (requires login)

**Navigation:**
- Navbar: Home, Browse Ghosts, etc.
- Related stories clickable

### `/twin` - AI Digital Twin 🔒
**Protected Route**
- Chat interface with AI
- Send messages about ghosts
- View conversation history
- Real-time responses

**Navigation:**
- Navbar: Home, Browse Ghosts, Bookmarks
- Back to Dashboard button

### `/preferences` - User Preferences 🔒
**Protected Route**
- Spookiness level slider (1-5)
- Email notifications toggle
- Recommendation alerts toggle
- Save button

**Navigation:**
- Navbar: Home, Browse Ghosts, etc.
- Back to Dashboard button

### `/bookmarks` - Saved Content 🔒
**Protected Route**
- List all bookmarked content
- Filter by content type
- Delete bookmarks
- View tags and notes

**Navigation:**
- Navbar: Home, Browse Ghosts, etc.
- Back to Dashboard button
- Browse Ghosts button (if empty)

### `/recommendations` - Personalized Content 🔒
**Protected Route**
- View AI-generated recommendations
- See match percentage
- Like/Dislike/Not Interested buttons
- Reasoning for each recommendation

**Navigation:**
- Navbar: Home, Browse Ghosts, etc.
- Back to Dashboard button
- Start Exploring button (if empty)

### `/stories` - Story Collection 🔒
**Protected Route**
- Browse available stories
- Track reading progress
- Mark as completed
- Link to ghost entities

**Navigation:**
- Navbar: Home, Browse Ghosts, etc.
- Back to Dashboard button

---

## Navigation Components

### Navbar (Reusable)
**Location:** `frontend/src/components/layout/Navbar.tsx`

**Logged Out:**
- Logo (links to home)
- Sign In button
- Sign Up button

**Logged In:**
- Logo (links to home)
- Browse Ghosts
- AI Twin
- Bookmarks
- Preferences
- Username (links to dashboard)
- Logout button

---

## Protected Routes

All protected routes use `<ProtectedRoute>` wrapper:
- Checks authentication status
- Shows loading spinner while checking
- Redirects to `/login` if not authenticated
- Renders content if authenticated

**Protected Pages:**
- `/dashboard`
- `/twin`
- `/preferences`
- `/bookmarks`
- `/recommendations`
- `/stories`

**Public Pages:**
- `/` (home)
- `/login`
- `/register`
- `/ghosts`
- `/ghosts/[id]`

---

## API Integration Points

### Dashboard
- Displays user info from auth context
- Links to all features

### Ghosts Pages
- `ghostsApi.search()` - Browse ghosts
- `ghostsApi.getById()` - Ghost details
- `bookmarksApi.create()` - Bookmark ghost

### AI Twin
- `digitalTwinApi.sendMessage()` - Send chat
- `digitalTwinApi.getHistory()` - Load history

### Preferences
- `userApi.getPreferences()` - Load settings
- `userApi.updatePreferences()` - Save settings

### Bookmarks
- `bookmarksApi.getAll()` - List bookmarks
- `bookmarksApi.delete()` - Remove bookmark

### Recommendations
- `recommendationsApi.get()` - Get suggestions
- `recommendationsApi.submitFeedback()` - Like/dislike

---

## User Flow Examples

### New User Journey
1. Visit `/` → See landing page
2. Click "Sign Up" → `/register`
3. Fill form → Auto-redirect to `/dashboard`
4. See 6 feature cards
5. Click "Browse Ghosts" → `/ghosts`
6. Click a ghost → `/ghosts/[id]`
7. Click "Bookmark" → Saved!
8. Click "Bookmarks" in navbar → `/bookmarks`
9. See saved ghost

### Returning User Journey
1. Visit `/` → See landing page
2. Click "Sign In" → `/login`
3. Enter credentials → Auto-redirect to `/dashboard`
4. Click "AI Digital Twin" → `/twin`
5. Chat with AI about ghosts
6. Click "Preferences" → `/preferences`
7. Adjust spookiness level
8. Click "Save" → Updated!

---

## Quick Reference

**Start Here:** `/` (Landing page)  
**After Login:** `/dashboard` (Hub for all features)  
**Browse Content:** `/ghosts` (Public)  
**AI Chat:** `/twin` (Protected)  
**Settings:** `/preferences` (Protected)  
**Saved Items:** `/bookmarks` (Protected)  

All pages have consistent navigation via the Navbar component!
