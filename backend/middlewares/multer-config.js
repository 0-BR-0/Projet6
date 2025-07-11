const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').replace(/\.[^/.]+$/, '');;
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage: storage }).single('image');

module.exports.imageOpti = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const uploadedImagePath = req.file.path;
    const fileName = req.file.filename;
    const fileExtension = path.extname(fileName);
    const optimizedFileName = fileName.replace(fileExtension, ".webp");
    const optimizedImagePath = path.join('images', optimizedFileName);

    sharp.cache(false);

    sharp(uploadedImagePath)
        .webp({ quality: 20 })
        .toFile(optimizedImagePath)
        .then(() => {
            fs.unlink(uploadedImagePath)
                .then(() => {
                    req.file.path = optimizedFileName;
                    next();
                })
                .catch(err => {
                    console.error("Erreur lors de la suppression de l'image originale", err);
                    next();
                });
        })
        .catch(err => {
            return res.status(500).json({ message: "Erreur lors de l'optimisation de l'image", error: err });
        });
};