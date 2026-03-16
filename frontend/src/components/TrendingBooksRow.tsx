import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BookCard from "./BookCard";
import { books, type Book } from "@/data/books";

interface Props {
  onBookClick?: (book: Book) => void;
}

const TrendingBooksRow = ({ onBookClick }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl font-bold">Trending Now</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 rounded-full bg-secondary border border-border hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll("right")} className="p-2 rounded-full bg-secondary border border-border hover:bg-muted transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-4">
          {[...books, ...books].map((book, i) => (
            <motion.div
              key={`${book.id}-${i}`}
              className="flex-shrink-0 w-44"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <BookCard book={book} compact onClick={() => onBookClick?.(book)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingBooksRow;
