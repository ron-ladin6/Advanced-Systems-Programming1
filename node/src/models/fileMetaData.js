const mongoose = require("mongoose");

// Sub-document for permissions
const permissionSchema = new mongoose.Schema(
  {
    userId: String,
    role: String,
  },
  { _id: false } // No need for internal _id for permissions
);

// Main File Schema
const fileSchema = new mongoose.Schema(
  {
    // We explicitly define _id as a String so we can provide our own UUID
    _id: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    ownerId: { type: String, required: true },
    type: { type: String },
    parentId: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    size: { type: Number },
    created: { type: Date, default: Date.now },
    lastAccessed: { type: Date, default: Date.now },
    permissions: [permissionSchema],
  },
  {
    // "virtuals: true" ensures that when we convert this doc to JSON (for React),
    // Mongoose will copy "_id" into a new field called "id".
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    // Ensure "id" virtual getter is enabled
    id: true,
  }
);

module.exports = mongoose.model("FileMetadata", fileSchema);
