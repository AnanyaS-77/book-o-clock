import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

interface Book {
  title: string;
  cover: string;
  author?: string;
  description?: string;
  year?: string;
  genre?: string;
  pages?: string | number;
  rating?: string | number;
}

interface Props {
  book: Book | null;
  onClose: () => void;
}

const BookDetailsModal = ({ book, onClose }: Props) => {
  const [rating, setRating] = useState(0);

  const getStoredRating = (title: string) => {
    const stored = localStorage.getItem(`rating-${title}`);
    return stored ? parseInt(stored, 10) : 0;
  };

  const saveRating = (title: string, rate: number) => {
    localStorage.setItem(`rating-${title}`, rate.toString());
  };

  useEffect(() => {
    if (book) {
      setRating(getStoredRating(book.title));
    }
  }, [book?.title]);

  const handleRatingClick = (star: number) => {
    setRating(star);
    if (book) {
      saveRating(book.title, star);
    }
  };

  const handleBuy = () => {
    const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(book?.title || "")}`;
    window.open(url, "_blank");
  };

  const handleRead = () => {
    const url = `https://archive.org/search?query=${encodeURIComponent(book?.title || "")}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {book && (

        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-card rounded-2xl max-w-4xl w-full shadow-2xl border border-border p-8"
          >

            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-muted-foreground hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="grid md:grid-cols-[280px_1fr] gap-10">

              <img
                src={book.cover}
                alt={book.title}
                className="rounded-xl w-full h-[420px] object-cover"
              />

              <div className="flex flex-col">

                <h2 className="text-4xl font-bold mb-2">{book.title}</h2>

                <p className="text-muted-foreground mb-6">
                  by {book.author || "Unknown Author"}
                </p>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">

                    <span>{book.year}</span>

                    <span>•</span>

                    <span>{book.genre}</span>

                    <span>•</span>

                    <span>{book.pages} pages</span>

                    <span>•</span>

                    <span>Rating: {book.rating ?? "N/A"}</span>

                </div>

                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      className="text-yellow-400 hover:text-yellow-300 transition text-lg"
                    >
                      {star <= rating ? "★" : "☆"}
                    </button>
                  ))}
                </div>

                <p className="text-sm leading-relaxed mb-8">
                  {book.description || "No description available."}
                </p>

                <div className="flex gap-4 mb-6">

                  <button
                    onClick={handleBuy}
                    className="flex items-center gap-2 px-6 py-3 bg-primary rounded-lg hover:opacity-90 transition"
                  >
                    <ShoppingCart size={18} />
                    Buy Book
                  </button>

                  <button
                    onClick={handleRead}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary rounded-lg"
                  >
                    <BookOpen size={18} />
                    Read Online
                  </button>

                </div>

                <div className="flex gap-4">

                  <button className="px-6 py-2 rounded-lg hover:bg-muted transition">
                    Add to Library
                  </button>

                  <button className="px-6 py-2 rounded-lg hover:bg-muted transition">
                    Write Review
                  </button>

                </div>

              </div>

            </div>

          </motion.div>

        </motion.div>

      )}
    </AnimatePresence>
  );
};

export default BookDetailsModal;