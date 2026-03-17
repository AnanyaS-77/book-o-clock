import { useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveBookCover } from "@/lib/covers";
import type { SavedBook } from "@/lib/library";

export interface ContinueReadingBook extends SavedBook {
  progress: number;
}

interface Props {
  books: ContinueReadingBook[];
  onBookClick?: (book: ContinueReadingBook) => void;
}

const ContinueReadingRow = ({ books, onBookClick }: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (books.length === 0) {
    return null;
  }

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <BookOpen className="h-4 w-4" />
              Continue Reading
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Pick up where you left off</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Your active reads, ready to jump back into with one click.
            </p>
          </div>

          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => scroll("left")}
              className="rounded-full border border-border bg-secondary p-2 transition-colors hover:bg-muted"
              aria-label="Scroll continue reading left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="rounded-full border border-border bg-secondary p-2 transition-colors hover:bg-muted"
              aria-label="Scroll continue reading right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {books.map((book, index) => (
            <motion.button
              key={book.title}
              type="button"
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.32, delay: index * 0.04 }}
              onClick={() => onBookClick?.(book)}
              className="group relative min-w-[260px] max-w-[260px] flex-shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-card/80 text-left shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-colors hover:border-primary/40"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_35%)] opacity-80" />

              <div className="relative p-4">
                <div className="relative overflow-hidden rounded-2xl bg-black/30">
                  <img
                    src={resolveBookCover({
                      title: book.title,
                      author: book.author,
                      primaryCover: book.cover,
                    })}
                    alt={book.title}
                    className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent" />
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-md">
                    {book.progress}% completed
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="line-clamp-2 font-display text-xl font-semibold text-foreground">
                    {book.title}
                  </h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {book.author || "Unknown Author"}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Progress</span>
                    <span>{book.progress}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-cyan-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${book.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.08 + index * 0.03 }}
                    />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContinueReadingRow;
