import { query } from '../config/database';

export enum ContentType {
  GHOST_ENTITY = 'ghost_entity',
  STORY = 'story',
  MOVIE = 'movie',
  MYTH = 'myth'
}

export interface Bookmark {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  tags: string[];
  notes: string;
  createdAt: Date;
}

export interface BookmarkWithMetadata extends Bookmark {
  contentTitle?: string;
  contentDescription?: string;
}

export interface BookmarkRepository {
  createBookmark(
    userId: string,
    contentId: string,
    contentType: ContentType,
    tags?: string[],
    notes?: string
  ): Promise<Bookmark>;
  getUserBookmarks(userId: string): Promise<BookmarkWithMetadata[]>;
  deleteBookmark(bookmarkId: string): Promise<void>;
  updateBookmarkTags(bookmarkId: string, tags: string[]): Promise<Bookmark>;
}

class BookmarkRepositoryImpl implements BookmarkRepository {
  /**
   * Create a new bookmark with polymorphic content references
   */
  async createBookmark(
    userId: string,
    contentId: string,
    contentType: ContentType,
    tags: string[] = [],
    notes: string = ''
  ): Promise<Bookmark> {
    const result = await query<any>(
      `INSERT INTO bookmarks (user_id, content_id, content_type, tags, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", content_id as "contentId",
                 content_type as "contentType", tags, notes,
                 created_at as "createdAt"`,
      [userId, contentId, contentType, tags, notes]
    );

    return result.rows[0];
  }

  /**
   * Get all bookmarks for a user with content metadata joins
   */
  async getUserBookmarks(userId: string): Promise<BookmarkWithMetadata[]> {
    const result = await query<any>(
      `SELECT 
         b.id,
         b.user_id as "userId",
         b.content_id as "contentId",
         b.content_type as "contentType",
         b.tags,
         b.notes,
         b.created_at as "createdAt",
         CASE
           WHEN b.content_type = 'ghost_entity' THEN ge.name
           WHEN b.content_type = 'story' THEN s.title
           ELSE NULL
         END as "contentTitle",
         CASE
           WHEN b.content_type = 'ghost_entity' THEN ge.description
           WHEN b.content_type = 'story' THEN LEFT(s.content, 200)
           ELSE NULL
         END as "contentDescription"
       FROM bookmarks b
       LEFT JOIN ghost_entities ge ON b.content_type = 'ghost_entity' AND b.content_id = ge.id
       LEFT JOIN stories s ON b.content_type = 'story' AND b.content_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Delete a bookmark
   */
  async deleteBookmark(bookmarkId: string): Promise<void> {
    const result = await query(
      'DELETE FROM bookmarks WHERE id = $1 RETURNING id',
      [bookmarkId]
    );

    if (result.rows.length === 0) {
      throw new Error('Bookmark not found');
    }
  }

  /**
   * Update bookmark tags
   */
  async updateBookmarkTags(bookmarkId: string, tags: string[]): Promise<Bookmark> {
    const result = await query<any>(
      `UPDATE bookmarks
       SET tags = $1
       WHERE id = $2
       RETURNING id, user_id as "userId", content_id as "contentId",
                 content_type as "contentType", tags, notes,
                 created_at as "createdAt"`,
      [tags, bookmarkId]
    );

    if (result.rows.length === 0) {
      throw new Error('Bookmark not found');
    }

    return result.rows[0];
  }
}

export const bookmarkRepository = new BookmarkRepositoryImpl();
