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
import { CacheInvalidation } from '../middleware/cache.middleware';

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
    const startTime = Date.now();

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

    // Invalidate caches (must complete within 1 second as per requirement 7.4)
    await this.invalidateBookmarkCaches(userId);

    // Verify invalidation completed within time limit
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > 1000) {
      console.warn(`Bookmark cache invalidation took ${elapsedTime}ms, exceeding 1 second limit`);
    }

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
    const startTime = Date.now();

    // Delete the bookmark
    await bookmarkRepository.deleteBookmark(bookmarkId);

    // Invalidate caches (must complete within 1 second as per requirement 7.4)
    await this.invalidateBookmarkCaches(userId);

    // Verify invalidation completed within time limit
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > 1000) {
      console.warn(`Bookmark cache invalidation took ${elapsedTime}ms, exceeding 1 second limit`);
    }
  }

  /**
   * Update bookmark tags (organize)
   */
  async organizeBookmark(
    userId: string,
    bookmarkId: string,
    tags: string[]
  ): Promise<Bookmark> {
    const startTime = Date.now();

    // Update tags
    const bookmark = await bookmarkRepository.updateBookmarkTags(bookmarkId, tags);

    // Invalidate caches (must complete within 1 second as per requirement 7.4)
    await this.invalidateBookmarkCaches(userId);

    // Verify invalidation completed within time limit
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > 1000) {
      console.warn(`Bookmark cache invalidation took ${elapsedTime}ms, exceeding 1 second limit`);
    }

    return bookmark;
  }

  /**
   * Invalidate all bookmark-related caches for a user
   * Must complete within 1 second (requirement 7.4)
   */
  private async invalidateBookmarkCaches(userId: string): Promise<void> {
    // Run invalidations in parallel for speed
    await Promise.all([
      // Invalidate bookmark data cache
      cacheDelete(CacheKeys.bookmarks(userId)),
      
      // Invalidate cached API responses for bookmarks
      CacheInvalidation.invalidateBookmarkCaches(userId),
    ]);
  }
}

export const bookmarkService = new BookmarkServiceImpl();
