const mongoose = require('mongoose');
const { TYPES } = require('../utils/helpers');

const itemSchema = new mongoose.Schema(
  {
    contentId: { type: String, required: true },
    type: { type: String, enum: TYPES, required: true },
    title: { type: String, required: true },
    posterUrl: { type: String, default: null },
  },
  { _id: false }
);

const collectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    items: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collection', collectionSchema);