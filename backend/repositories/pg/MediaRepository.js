// backend/repositories/pg/MediaRepository.js — media (CMS)
const BaseRepository = require('./BaseRepository');
const { media } = require('../../../db/schema/cms');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class MediaRepository extends BaseRepository {
  constructor() {
    super(media, {
      relations: {
        uploadedBy: { table: users, on: eq(media.uploadedById, users.id) },
      },
    });
  }
}

module.exports = new MediaRepository();