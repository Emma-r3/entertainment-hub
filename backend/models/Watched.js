const mongoose = require('mongoose');
const { TYPES } = require('../utils/helpers');

const watchedSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentId: { type: String, required: true },
    type: { type: String, enum: TYPES, required: true },
    title: { type: String, required: true },
    posterUrl: { type: String, default: null },
  },
  { timestamps: true }
);

watchedSchema.index({ userId: 1, contentId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Watched', watchedSchema);