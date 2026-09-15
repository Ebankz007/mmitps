/**
 * NoteService — PostgreSQL edition.
 */
const NoteRepository = require('../../repositories/pg/NoteRepository');
const ApiError = require('../../utils/ApiError');

class NoteService {
  /**
   * Get all notes for a user
   * @param {String} userId
   * @param {Object} options - { category, search, limit, skip }
   */
  async getUserNotes(userId, options = {}) {
    const filters = { userId };

    if (options.category) {
      filters.category = options.category;
    }

    const notes = await NoteRepository.findAll(filters, {
      sort: 'createdAt',
      direction: 'desc',
      limit: options.limit || 50,
      page: Math.floor((options.skip || 0) / (options.limit || 50)) + 1,
    });

    // Client-side search on title/content (case-insensitive)
    if (options.search) {
      const q = String(options.search).toLowerCase();
      return notes.filter(
        (n) =>
          (n.title || '').toLowerCase().includes(q) ||
          (n.content || '').toLowerCase().includes(q)
      );
    }

    // Pinned first, then newest
    return notes.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }

  /**
   * Create a new note
   */
  async createNote(userId, noteData) {
    return NoteRepository.create({ userId, ...noteData });
  }

  /**
   * Update a note (ownership-scoped)
   */
  async updateNote(noteId, userId, updateData) {
    const note = await NoteRepository.findByUserAndId(userId, noteId);
    if (!note) {
      throw new ApiError(404, 'Note not found');
    }
    return NoteRepository.update(noteId, updateData);
  }

  /**
   * Delete a note (ownership-scoped)
   */
  async deleteNote(noteId, userId) {
    const note = await NoteRepository.findByUserAndId(userId, noteId);
    if (!note) {
      throw new ApiError(404, 'Note not found');
    }
    return NoteRepository.delete(noteId);
  }

  /**
   * Toggle pin status (ownership-scoped)
   */
  async togglePin(noteId, userId) {
    const note = await NoteRepository.findByUserAndId(userId, noteId);
    if (!note) {
      throw new ApiError(404, 'Note not found');
    }
    return NoteRepository.update(noteId, { isPinned: !note.isPinned });
  }
}

module.exports = new NoteService();