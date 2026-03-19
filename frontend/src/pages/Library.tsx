import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Library as LibraryIcon, MessageSquare, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import BookDetailsModal from "@/components/BookDetailsModal";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserShelf } from "@/components/library/UserShelfProvider";
import { useToast } from "@/hooks/use-toast";
import { applyFallbackCover, resolveBookCover } from "@/lib/covers";
import {
  type ReadingStatus,
  type ReadingProgressEntry,
  type SavedBook,
} from "@/lib/library";

type LibraryFilter = "all" | "not-started" | "reading" | "completed";

const Library = () => {
  const [selectedBook, setSelectedBook] = useState<SavedBook | null>(null);
  const [draftProgress, setDraftProgress] = useState<Record<string, ReadingProgressEntry | null>>({});
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");
  const { toast } = useToast();
  const {
    isLoading,
    libraryBooks,
    progressMap,
    getReview,
    saveProgress,
    removeBook,
  } = useUserShelf();

  useEffect(() => {
    setDraftProgress(progressMap);
  }, [progressMap]);

  const updateDraftProgress = (title: string, progress: number) => {
    setDraftProgress((current) => {
      const existing = current[title] ?? null;
      const nextProgress = Math.min(100, Math.max(0, Math.round(progress)));

      return {
        ...current,
        [title]: existing
          ? {
              ...existing,
              progress: nextProgress,
              status: nextProgress >= 100 ? "completed" : "reading",
            }
          : {
              title,
              progress: nextProgress,
              status: nextProgress >= 100 ? "completed" : "reading",
            },
      };
    });
  };

  const persistProgress = (book: SavedBook, progress: number, status: ReadingStatus) => {
    const nextProgress = Math.min(100, Math.max(0, Math.round(progress)));

    void saveProgress(book, nextProgress, status);

    setDraftProgress((current) => ({
      ...current,
      [book.title]: {
        title: book.title,
        progress: nextProgress,
        status: nextProgress >= 100 ? "completed" : status,
      },
    }));
  };

  const handleStartReading = (book: SavedBook) => {
    const progress = draftProgress[book.title]?.progress ?? 0;
    persistProgress(book, progress, "reading");
    toast({
      title: "Reading tracker started",
      description: `${book.title} is now on your reading list.`,
    });
  };

  const handleUpdateProgress = (book: SavedBook) => {
    const progress = draftProgress[book.title]?.progress ?? 0;
    const nextStatus: ReadingStatus = progress >= 100 ? "completed" : "reading";

    persistProgress(book, progress, nextStatus);
    toast({
      title: "Progress updated",
      description: `${book.title} is now ${progress}% complete.`,
    });
  };

  const handleMarkCompleted = (book: SavedBook) => {
    persistProgress(book, 100, "completed");
    toast({
      title: "Book completed",
      description: `You marked ${book.title} as completed.`,
    });
  };

  const handleRemoveBook = (title: string) => {
    void removeBook(title);
    setDraftProgress((current) => {
      const next = { ...current };
      delete next[title];
      return next;
    });

    if (selectedBook?.title === title) {
      setSelectedBook(null);
    }

    toast({
      title: "Removed from library",
      description: `${title} was removed from your saved books.`,
    });
  };

  const getBookProgress = (title: string) => draftProgress[title] ?? progressMap[title] ?? null;

  const getFilterCount = (filter: LibraryFilter) => {
    if (filter === "all") {
      return libraryBooks.length;
    }

    return libraryBooks.filter((book) => {
      const progress = getBookProgress(book.title);

      if (filter === "not-started") {
        return !progress;
      }

      if (filter === "reading") {
        return progress?.status === "reading";
      }

      return progress?.status === "completed";
    }).length;
  };

  const filteredBooks = libraryBooks.filter((book) => {
    const progress = getBookProgress(book.title);

    if (activeFilter === "all") {
      return true;
    }

    if (activeFilter === "not-started") {
      return !progress;
    }

    if (activeFilter === "reading") {
      return progress?.status === "reading";
    }

    return progress?.status === "completed";
  });

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
        {isLoading ? (
          <div className="rounded-3xl border border-border bg-card/60 px-8 py-20 text-center">
            <h2 className="text-2xl font-semibold">Loading your library...</h2>
          </div>
        ) : libraryBooks.length === 0 ? (
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
          <>
            <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/70 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Filter your shelf</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Jump between unread saves, active reads, and completed books.
                </p>
              </div>

              <Tabs
                value={activeFilter}
                onValueChange={(value) => setActiveFilter(value as LibraryFilter)}
                className="w-full lg:w-auto"
              >
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-background/70 p-2 lg:w-auto lg:grid-cols-4">
                  <TabsTrigger value="all" className="rounded-xl px-4 py-2.5">
                    All ({getFilterCount("all")})
                  </TabsTrigger>
                  <TabsTrigger value="not-started" className="rounded-xl px-4 py-2.5">
                    Not Started ({getFilterCount("not-started")})
                  </TabsTrigger>
                  <TabsTrigger value="reading" className="rounded-xl px-4 py-2.5">
                    Reading ({getFilterCount("reading")})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-xl px-4 py-2.5">
                    Completed ({getFilterCount("completed")})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 px-8 py-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">No books in this filter yet</h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  {activeFilter === "not-started" && "Every saved book has reading activity right now."}
                  {activeFilter === "reading" && "Start a book or update progress to see active reads here."}
                  {activeFilter === "completed" && "Finish a book to build out your completed shelf."}
                  {activeFilter === "all" && "Your saved books will show up here."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredBooks.map((book, index) => {
              const review = getReview(book.title);
              const storedProgress = progressMap[book.title] ?? null;
              const progress = draftProgress[book.title] ?? storedProgress;

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
                          src={resolveBookCover({
                            title: book.title,
                            author: book.author,
                            primaryCover: book.cover,
                          })}
                          alt={book.title}
                          className="h-40 w-28 rounded-lg object-cover shadow-lg"
                          onError={(event) => applyFallbackCover(event, book.title, book.author)}
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
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">Reading Progress</div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            progress?.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : progress?.status === "reading"
                                ? "bg-primary/15 text-primary"
                                : "bg-white/5 text-muted-foreground"
                          }`}
                        >
                          {progress?.status === "completed"
                            ? "Completed"
                            : progress?.status === "reading"
                              ? `${progress.progress}% completed`
                              : "Not started"}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-cyan-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress?.progress ?? 0}%` }}
                          transition={{ duration: 0.4, delay: 0.08 + index * 0.03 }}
                        />
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            <span>Update Progress</span>
                            <span>{progress?.progress ?? 0}%</span>
                          </div>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[progress?.progress ?? 0]}
                            onValueChange={([value]) => updateDraftProgress(book.title, value)}
                            className="w-full"
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {!storedProgress && (
                            <button
                              onClick={() => handleStartReading(book)}
                              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                            >
                              Start Reading
                            </button>
                          )}
                          {storedProgress && (
                            <button
                              onClick={() => handleUpdateProgress(book)}
                              className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                            >
                              Update Progress
                            </button>
                          )}
                          {storedProgress?.status !== "completed" && (
                            <button
                              onClick={() => handleMarkCompleted(book)}
                              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                            >
                              Mark as Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

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
          </>
        )}
      </section>

      <BookDetailsModal
        book={selectedBook}
        onClose={() => {
          setSelectedBook(null);
        }}
      />
    </div>
  );
};

export default Library;
