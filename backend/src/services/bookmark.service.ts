import {
  bookmarkRepository,
  Bookmark,
  BookmarkWithMetadata,
  ContentType
} from '../repositories/bookmark.repository';
import {
  interactionRepository,
  InteractionType
} from '../repositories/interaction.repository';
import { cacheGet, cacheSet, cacheDelete, CacheKeys, CacheTTL } from '../config/redis';

export interface BookmarkService {
  addBookmark(
    userId: string,
    contentId: string,
    contentType: ContentType,
    tags?: string[],
    notes?: string
  ): Promise<Bookmark>;
  getUserBookmarks(userId: string): Promise<BookmarkWithMetadata[]>;
  removeBookmark(userId: string, bookmarkId: string): Promise<void>;
  organizeBookmark(userId: string, bookmarkId: string, tags: string[]): Promise<Bookmark>;
}

class BookmarkServiceImpl implements BookmarkService {
  /**
   * Add a bookmark with interaction event recording
   */
  async addBookmark(
    userId: string,
    contentId: string,
    contentType: ContentType,
    tags: string[] = [],
    notes: string = ''
  ): Promise<Bookmark> {
    // Create the bookmark
    const bookmark = await bookmarkRepository.createBookmark(
      userId,
      contentId,
      contentType,
      tags,
      notes
    );

    // Record interaction event for recommendation engine
    await interactionRepository.recordInteraction(
      userId,
      contentId,
      contentType,
      InteractionType.BOOKMARK
    );

    // Invalidate bookmarks cache
    await cacheDelete(CacheKeys.bookmarks(userId));

    return bookmark;
  }

  /**
   * Get user bookmarks with content details and caching
   */
  async getUserBookmarks(userId: string): Promise<BookmarkWithMetadata[]> {
    // Check cache first
    const cacheKey = CacheKeys.bookmarks(userId);
    const cached = await cacheGet<BookmarkWithMetadata[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const bookmarks = await bookmarkRepository.getUserBookmarks(userId);

    // Cache the result
    await cacheSet(cacheKey, bookmarks, CacheTTL.default);

    return bookmarks;
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(userId: string, bookmarkId: string): Promise<void> {
    // Delete the bookmark
    await bookmarkRepository.deleteBookmark(bookmarkId);

    // Invalidate bookmarks cache
    await cacheDelete(CacheKeys.bookmarks(userId));
  }

  /**
   * Update bookmark tags (organize)
   */
  async organizeBookmark(
    userId: string,
    bookmarkId: string,
    tags: string[]
  ): Promise<Bookmark> {
    // Update tags
    const bookmark = await bookmarkRepository.updateBookmarkTags(bookmarkId, tags);

    // Invalidate bookmarks cache
    await cacheDelete(CacheKeys.bookmarks(userId));

    return bookmark;
  }
}

export const bookmarkService = new BookmarkServiceImpl();
