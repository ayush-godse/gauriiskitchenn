const GalleryPhoto = require("../model/galleryPhoto");
const cloudinary = require("../config/cloudinary");

const uploadImage = (buffer) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        { folder: "product-gallery" },
        (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        }
    );
    stream.end(buffer);
});

const deleteCloudinaryImage = async (cloudinaryId) => {
    const result = await cloudinary.uploader.destroy(cloudinaryId);
    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Could not remove the previous gallery image from Cloudinary.");
    }
};

const getGalleryPhotos = async (req, res) => {
    try {
        const photos = await GalleryPhoto.find({})
            .sort({ slot: 1 })
            .select("_id imageURL");
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: error.message || "Could not load gallery photos." });
    }
};

const addGalleryPhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Choose an image to upload." });
    }

    let uploadedImage;
    try {
        const photos = await GalleryPhoto.find({}).select("slot");
        const occupiedSlots = new Set(photos.map((photo) => photo.slot));
        const slot = Array.from({ length: 10 }, (_, index) => index)
            .find((index) => !occupiedSlots.has(index));

        if (slot === undefined) {
            return res.status(409).json({ message: "The gallery already has 10 photos. Remove one before adding another." });
        }

        uploadedImage = await uploadImage(req.file.buffer);
        const photo = await GalleryPhoto.create({
            slot,
            imageURL: uploadedImage.secure_url,
            cloudinaryId: uploadedImage.public_id
        });
        res.status(201).json({ _id: photo._id, imageURL: photo.imageURL });
    } catch (error) {
        if (uploadedImage?.public_id) {
            try {
                await deleteCloudinaryImage(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Could not clean up an unlisted gallery image:", cleanupError);
            }
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: "The gallery changed while uploading. Please try again." });
        }
        res.status(500).json({ message: error.message || "Could not upload the gallery photo." });
    }
};

const replaceGalleryPhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Choose an image to upload." });
    }

    let uploadedImage;
    try {
        const photo = await GalleryPhoto.findById(req.params.id);
        if (!photo) {
            return res.status(404).json({ message: "Gallery photo not found." });
        }

        uploadedImage = await uploadImage(req.file.buffer);
        const previousCloudinaryId = photo.cloudinaryId;
        photo.imageURL = uploadedImage.secure_url;
        photo.cloudinaryId = uploadedImage.public_id;
        await photo.save();

        try {
            await deleteCloudinaryImage(previousCloudinaryId);
        } catch (cleanupError) {
            console.error("Could not remove the replaced gallery image:", cleanupError);
        }

        res.json({ _id: photo._id, imageURL: photo.imageURL });
    } catch (error) {
        if (uploadedImage?.public_id) {
            try {
                await deleteCloudinaryImage(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Could not clean up a failed replacement image:", cleanupError);
            }
        }
        res.status(500).json({ message: error.message || "Could not replace the gallery photo." });
    }
};

const removeGalleryPhoto = async (req, res) => {
    try {
        const photo = await GalleryPhoto.findByIdAndDelete(req.params.id);
        if (!photo) {
            return res.status(404).json({ message: "Gallery photo not found." });
        }

        try {
            await deleteCloudinaryImage(photo.cloudinaryId);
        } catch (cleanupError) {
            console.error("Could not remove a deleted gallery photo from Cloudinary:", cleanupError);
            return res.status(502).json({ message: "The photo was removed from the gallery, but its stored image could not be deleted." });
        }

        res.json({ message: "Gallery photo removed." });
    } catch (error) {
        res.status(500).json({ message: error.message || "Could not remove the gallery photo." });
    }
};

module.exports = {
    getGalleryPhotos,
    addGalleryPhoto,
    replaceGalleryPhoto,
    removeGalleryPhoto
};
