const Note = require('../models/Note');
const ApiError = require('../utils/ApiError');

class NoteService {
    /**
     * Get all notes for a user
     * @param {String} userId 
     * @param {Object} options - { category, search, limit, skip }
     * @returns {Promise<Array>}
     */
    async getUserNotes(userId, options = {}) {
        const query = { user: userId };

        if (options.category) {
            query.category = options.category;
        }

        if (options.search) {
            query.$or = [
                { title: { $regex: options.search, $options: 'i' } },
                { content: { $regex: options.search, $options: 'i' } }
            ];
        }

        return Note.find(query)
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(options.limit || 50)
            .skip(options.skip || 0);
    }

    /**
     * Create a new note
     * @param {String} userId 
     * @param {Object} noteData 
     * @returns {Promise<Document>}
     */
    async createNote(userId, noteData) {
        const note = await Note.create({
            user: userId,
            ...noteData
        });
        return note;
    }

    /**
     * Update a note
     * @param {String} noteId 
     * @param {String} userId 
     * @param {Object} updateData 
     * @returns {Promise<Document>}
     */
    async updateNote(noteId, userId, updateData) {
        const note = await Note.findOne({ _id: noteId, user: userId });

        if (!note) {
            throw new ApiError(404, 'Note not found');
        }

        Object.assign(note, updateData);
        await note.save();
        return note;
    }

    /**
     * Delete a note
     * @param {String} noteId 
     * @param {String} userId 
     * @returns {Promise<void>}
     */
    async deleteNote(noteId, userId) {
        const result = await Note.deleteOne({ _id: noteId, user: userId });

        if (result.deletedCount === 0) {
            throw new ApiError(404, 'Note not found');
        }
    }

    /**
     * Toggle pin status
     * @param {String} noteId 
     * @param {String} userId 
     * @returns {Promise<Document>}
     */
    async togglePin(noteId, userId) {
        const note = await Note.findOne({ _id: noteId, user: userId });

        if (!note) {
            throw new ApiError(404, 'Note not found');
        }

        note.isPinned = !note.isPinned;
        await note.save();
        return note;
    }
}

module.exports = new NoteService();
