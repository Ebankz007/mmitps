/**
 * NoteRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { notes } = require('../../../db/schema/core');

class NoteRepository extends BaseRepository {
  constructor() {
    super(notes);
  }

  async findByUserAndId(userId, noteId) {
    return this.findOne({ userId, id: noteId });
  }

  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, options);
  }
}

module.exports = new NoteRepository();