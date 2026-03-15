import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, BookOpen, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { books as localBooks } from "@/data/books";


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
  onSelectBook?: (book: Book) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

const BookDetailsModal = ({ book, onClose, onSelectBook, onBack, canGoBack = false }: Props) => {
  const [rating, setRating] = useState(0);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (book) {
      console.log("BookDetailsModal showing book:", book);
    }
  }, [book]);

  const getStoredRating = (title: string) => {
    const stored = localStorage.getItem(`rating-${title}`);
    return stored ? parseInt(stored, 10) : 0;
  };

  const saveRating = (title: string, rate: number) => {
    localStorage.setItem(`rating-${title}`, rate.toString());
  };
  useEffect(() => {
  if (book) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [book]);

  useEffect(() => {
    if (book) {
      setRating(getStoredRating(book.title));
    }
  }, [book?.title]);

  useEffect(() => {
    const fetchSimilarBooks = async () => {
      if (!book?.title) {
        setSimilarBooks([]);
        return;
      }

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/recommend?book=${encodeURIComponent(book.title)}`
        );

        if (!res.ok) {
          console.error("Similar books request failed:", res.status);
          return;
        }

        const data = await res.json();

        const results = (data.recommendations || []).slice(0, 6).map((rec: any) => {
          const localMatch = localBooks.find((b) => b.title === rec.title);
          const isbn = rec.isbn13 || rec.isbn;
          const openLibraryCover = isbn
            ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
            : "/placeholder.svg";
          const year = rec.publication_date ? rec.publication_date.split("-")[0] : "Unknown";

          return {
            title: rec.title,
            cover: localMatch?.cover || openLibraryCover,
            author: rec.authors || localMatch?.author || "Unknown Author",
            description: localMatch?.description || "No description available.",
            genre: localMatch?.genre || "Unknown Genre",
            year,
            rating: rec.average_rating || "N/A",
            pages: rec.num_pages || "N/A",
          };
        });

        results.forEach((similarBook: Book) => {
          if (similarBook.cover && similarBook.cover !== "/placeholder.svg") {
            const image = new Image();
            image.src = similarBook.cover;
          }
        });

        setSimilarBooks(results);
      } catch (error) {
        console.error("Error fetching similar books:", error);
      }
    };

    fetchSimilarBooks();
  }, [book]);

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

  useEffect(() => {
    if (!book) return;

    modalContentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [book]);

  const handleSimilarBookClick = (similarBook: Book) => {
    if (!onSelectBook) return;

    onSelectBook(similarBook);
  };

  return (
    <AnimatePresence>
      {book && (

        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >

          <motion.div
            ref={modalContentRef}
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-card rounded-2xl max-w-4xl w-full shadow-2xl border border-border p-8 max-h-[80vh] overflow-y-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="min-w-[96px]">
                {canGoBack && onBack && (
                  <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-border hover:bg-muted hover:text-white"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={book.title}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="grid md:grid-cols-[280px_1fr] gap-10"
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="rounded-xl w-full h-[420px] object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== "/placeholder.svg") {
                      target.src = "/placeholder.svg";
                    }
                  }}
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
              </motion.div>
            </AnimatePresence>

            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">
                More Like This
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                {similarBooks.map((b, i) => (
                  <div
                    key={i}
                    className="min-w-[120px] max-w-[120px] flex flex-col items-center cursor-pointer hover:scale-105 transition"
                    onClick={() => handleSimilarBookClick(b)}
                  >
                    <img
                      src={b.cover}
                      alt={b.title}
                      className="rounded-lg w-[120px] h-[180px] object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== "/placeholder.svg") {
                          target.src = "/placeholder.svg";
                        }
                      }}
                    />

                    <div className="mt-2 h-10 w-full text-center">
                      <p className="text-xs line-clamp-2 text-muted-foreground">
                        {b.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>

        </motion.div>

      )}
    </AnimatePresence>
  );
};

export default BookDetailsModal;
