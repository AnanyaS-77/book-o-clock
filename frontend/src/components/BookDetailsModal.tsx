import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, BookOpen, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { books as localBooks } from "@/data/books";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  getStoredLibrary,
  getStoredReview,
  saveLibrary,
  saveReview,
  type SavedBook,
} from "@/lib/library";


type Book = SavedBook;

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
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewDraft, setReviewDraft] = useState("");
  const [savedReview, setSavedReview] = useState("");
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const existingReview = getStoredReview(book.title);
      const library = getStoredLibrary();

      setSavedReview(existingReview);
      setReviewDraft(existingReview);
      setIsReviewing(false);
      setIsInLibrary(library.some((libraryBook) => libraryBook.title === book.title));
    }
  }, [book?.title]);

  useEffect(() => {
    const fetchSimilarBooks = async () => {
      if (!book?.title) {
        setSimilarBooks([]);
        return;
      }

      try {
        const query = new URLSearchParams({
          book: book.title,
        });
        if (book.author) {
          query.set("author", book.author);
        }

        const res = await fetch(
          `http://127.0.0.1:8000/recommend?${query.toString()}`
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

  const handleToggleLibrary = () => {
    if (!book) return;

    const library = getStoredLibrary();
    const alreadySaved = library.some((libraryBook) => libraryBook.title === book.title);

    if (alreadySaved) {
      const updatedLibrary = library.filter((libraryBook) => libraryBook.title !== book.title);
      saveLibrary(updatedLibrary);
      setIsInLibrary(false);
      toast({
        title: "Removed from library",
        description: `${book.title} was removed from your saved books.`,
      });
      return;
    }

    const updatedLibrary = [...library, book];
    saveLibrary(updatedLibrary);
    setIsInLibrary(true);
    toast({
      title: "Added to library",
      description: `${book.title} is now in your saved books.`,
      action: (
        <ToastAction
          altText="Open my library"
          onClick={() => {
            onClose();
            navigate("/library");
          }}
        >
          View Library
        </ToastAction>
      ),
    });
  };

  const handleReviewSave = () => {
    if (!book) return;

    const trimmedReview = reviewDraft.trim();

    if (!trimmedReview) {
      toast({
        title: "Review is empty",
        description: "Write a few thoughts before saving your review.",
      });
      return;
    }

    saveReview(book.title, trimmedReview);
    setSavedReview(trimmedReview);
    setReviewDraft(trimmedReview);
    setIsReviewing(false);
    toast({
      title: "Review saved",
      description: `Your thoughts on ${book.title} are saved locally.`,
    });
  };

  const handleReviewCancel = () => {
    setReviewDraft(savedReview);
    setIsReviewing(false);
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
          <div className="relative w-full max-w-4xl">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground shadow-lg backdrop-blur transition hover:bg-muted hover:text-white"
            >
              <X size={22} />
            </button>

            <motion.div
              ref={modalContentRef}
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card p-8 pr-20 shadow-2xl"
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
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={book.title}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-10 md:grid-cols-[280px_1fr]"
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

                    <button
                      onClick={handleToggleLibrary}
                      className={`px-6 py-2 rounded-lg transition ${
                        isInLibrary
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "hover:bg-muted"
                      }`}
                    >
                      {isInLibrary ? "Saved in Library" : "Add to Library"}
                    </button>

                    <button
                      onClick={() => setIsReviewing(true)}
                      className="px-6 py-2 rounded-lg hover:bg-muted transition"
                    >
                      {savedReview ? "Edit Review" : "Write Review"}
                    </button>

                  </div>

                  {(savedReview || isReviewing) && (
                    <div className="mt-6 rounded-xl border border-border/70 bg-background/70 p-4">
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Your Review
                      </h3>

                      {isReviewing ? (
                        <div className="space-y-3">
                          <textarea
                            value={reviewDraft}
                            onChange={(event) => setReviewDraft(event.target.value)}
                            placeholder="What stood out to you about this book?"
                            className="min-h-[120px] w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
                          />

                          <div className="flex gap-3">
                            <button
                              onClick={handleReviewSave}
                              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:opacity-90"
                            >
                              Save Review
                            </button>
                            <button
                              onClick={handleReviewCancel}
                              className="rounded-lg px-4 py-2 text-sm transition hover:bg-muted"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {savedReview}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </motion.div>
            </AnimatePresence>

            {similarBooks.length > 0 && (
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
            )}

            </motion.div>
          </div>

        </motion.div>

      )}
    </AnimatePresence>
  );
};

export default BookDetailsModal;
