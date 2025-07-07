const Book = require("../models/book");
const fs = require('fs');


exports.getAllBooks = (req, res) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
}

exports.getOneBook = (req, res) => {

    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.createBook = (req, res) => {
    console.log("createBook:", req.body);

    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    });

    book.save()
        .then(() => { res.status(201).json({ message: "livre enregistré !" }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.modifyBook = (req, res) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Pas autorisé" });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Objet modifié!" }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });

}

exports.deleteBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Pas autorisé" });
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: "Objet supprimé !" }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.createRating = (req, res) => {
    const userId = req.auth.userId;
    const rating = req.body.rating;

    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: "La note doit être entre 0 et 5" });
    }

    Book.findById(req.params.id)
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: "Livre introuvable" });
            }

            const alreadyRated = book.ratings.find(r => r.userId === userId);
            if (alreadyRated) {
                return res.status(403).json({ message: "Vous avez déjà noté ce livre" });
            }

            book.ratings.push({ userId, grade: rating });

            const average = book.ratings.reduce((sum, r) => sum + r.grade, 0) / book.ratings.length;
            book.averageRating = average;

            return book.save()
                .then(updatedBook => {
                    res.status(200).json(updatedBook);
                });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getBestRating = (req, res) => {
    Book.find()
        .then(books => {
            if (!books || books.length === 0) {
                return res.status(200).json({ message: "Aucun livre trouvé" });
            }

            const topBooks = books
                .sort((a, b) => b.averageRating - a.averageRating)
                .slice(0, 3);

            res.status(200).json(topBooks);
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};