const mongoose = require('mongoose');
const { TYPES } = require('../utils/helpers');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    contentId: { type: String, required: true },
    type: { type: String, enum: TYPES, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

// Satu user hanya boleh satu ulasan per konten
reviewSchema.index({ userId: 1, contentId: 1, type: 1 }, { unique: true });
reviewSchema.index({ contentId: 1, type: 1 });

module.exports = mongoose.model('Review', reviewSchema);