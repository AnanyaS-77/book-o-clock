import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { DiscoveryBook } from "@/lib/discovery";
import BookCard from "./BookCard";

interface Props {
  books: DiscoveryBook[];
  genre: string;
  onBookClick: (book: DiscoveryBook) => void;
}

const PersonalizedRecommendationsRow = ({ books, genre, onBookClick }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (books.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,rgba(10,10,15,0.96),rgba(16,16,24,0.9))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Personalized For You
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white">
                Because you like {genre}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/65">
                Picked from your shelf and reading activity to keep the mood going.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white/80 transition-all duration-300 hover:border-primary/40 hover:bg-white/10 hover:text-white"
                aria-label="Scroll recommendations left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white/80 transition-all duration-300 hover:border-primary/40 hover:bg-white/10 hover:text-white"
                aria-label="Scroll recommendations right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          >
            {books.map((book, index) => (
              <motion.div
                key={`${book.title}-${book.author}-${index}`}
                className="w-44 flex-shrink-0"
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <BookCard
                  book={{
                    id: `${book.title}-${index}`,
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    cover: book.cover,
                    genre: book.genre || genre,
                  }}
                  compact
                  onClick={() => onBookClick(book)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PersonalizedRecommendationsRow;
