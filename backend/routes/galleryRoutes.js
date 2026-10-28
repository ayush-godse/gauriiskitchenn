const express = require("express");
const multer = require("multer");
const { protect } = require("../middilewers/authMiddleware");
const { admin } = require("../middilewers/adminMiddleware");
const {
    getGalleryPhotos,
    addGalleryPhoto,
    replaceGalleryPhoto,
    removeGalleryPhoto
} = require("../controllers/galleryController");

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
            return callback(new Error("Only image files are allowed."));
        }
        callback(null, true);
    }
});

const parseImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (error) {
            const message = error.code === "LIMIT_FILE_SIZE"
                ? "Images must be 8 MB or smaller."
                : error.message || "Could not process the uploaded image.";
            return res.status(400).json({ message });
        }
        next();
    });
};

router.get("/", getGalleryPhotos);
router.post("/", protect, admin, parseImage, addGalleryPhoto);
router.put("/:id", protect, admin, parseImage, replaceGalleryPhoto);
router.delete("/:id", protect, admin, removeGalleryPhoto);

module.exports = router;
