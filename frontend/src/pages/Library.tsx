import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Library as LibraryIcon, MessageSquare, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import BookDetailsModal from "@/components/BookDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { getStoredLibrary, getStoredReview, saveLibrary, type SavedBook } from "@/lib/library";

const Library = () => {
  const [libraryBooks, setLibraryBooks] = useState<SavedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<SavedBook | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLibraryBooks(getStoredLibrary());
  }, []);

  const handleRemoveBook = (title: string) => {
    const updatedBooks = libraryBooks.filter((book) => book.title !== title);
    saveLibrary(updatedBooks);
    setLibraryBooks(updatedBooks);

    if (selectedBook?.title === title) {
      setSelectedBook(null);
    }

    toast({
      title: "Removed from library",
      description: `${title} was removed from your saved books.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(135deg, hsl(270 80% 65% / 0.15), hsl(220 90% 60% / 0.12), hsl(330 80% 60% / 0.08))",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl transition hover:border-primary hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary-foreground">
              <LibraryIcon className="h-4 w-4" />
              Your Saved Shelf
            </div>
            <h1 className="text-5xl font-display font-bold tracking-tight">My Library</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Revisit books you saved, reopen their details, and keep your personal notes close by.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {libraryBooks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 px-8 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Your library is empty</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Save a book from the homepage and it will show up here with your review.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Explore Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {libraryBooks.map((book, index) => {
              const review = getStoredReview(book.title);

              return (
                <motion.article
                  key={book.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group overflow-hidden rounded-3xl border border-border bg-card/80 shadow-xl shadow-black/10"
                >
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="block w-full text-left"
                  >
                    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-card to-background px-6 py-8">
                      <div className="absolute inset-0 opacity-60">
                        <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-primary/10 blur-3xl" />
                        <div className="absolute bottom-6 right-8 h-24 w-24 rounded-full bg-accent/10 blur-3xl" />
                      </div>

                      <div className="relative rounded-2xl border border-white/10 bg-black/20 p-3 shadow-2xl shadow-black/30 transition duration-300 group-hover:-translate-y-1">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="h-40 w-28 rounded-lg object-cover shadow-lg"
                          onError={(event) => {
                            const target = event.currentTarget;
                            if (target.src !== "/placeholder.svg") {
                              target.src = "/placeholder.svg";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </button>

                  <div className="space-y-4 p-6">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {book.genre && <span>{book.genre}</span>}
                        {book.year && <span>{book.year}</span>}
                      </div>
                      <h2 className="text-2xl font-semibold">{book.title}</h2>
                      <p className="mt-1 text-muted-foreground">{book.author || "Unknown Author"}</p>
                    </div>

                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {book.description || "No description available."}
                    </p>

                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Your Review
                      </div>
                      <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                        {review || "No review yet. Open the book to write one."}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                      >
                        Open Book
                      </button>
                      <button
                        onClick={() => handleRemoveBook(book.title)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-muted"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <BookDetailsModal
        book={selectedBook}
        onClose={() => {
          setSelectedBook(null);
          setLibraryBooks(getStoredLibrary());
        }}
      />
    </div>
  );
};

export default Library;
