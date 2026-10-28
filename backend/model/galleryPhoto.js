const mongoose = require("mongoose");

const galleryPhotoSchema = new mongoose.Schema({
    slot: { type: Number, required: true, min: 0, max: 9, unique: true },
    imageURL: { type: String, required: true },
    cloudinaryId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("GalleryPhoto", galleryPhotoSchema);
