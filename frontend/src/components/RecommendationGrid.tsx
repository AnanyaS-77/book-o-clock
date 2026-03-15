import { useRef } from "react";
import { motion } from "framer-motion";
import BookCard from "./BookCard";

interface Book {
  title: string;
  cover: string;
}

interface Props {
  books: Book[];
  onBookClick?: (book: Book) => void;
}

const RecommendationGrid = ({ books, onBookClick }: Props) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (distance: number) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: distance, behavior: "smooth" });
  };


  if (!books || books.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto relative">

        <h2 className="font-display text-3xl font-bold mb-8">
          Recommended for You
        </h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollBy(-280)}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white shadow-lg hover:bg-black/60"
            aria-label="Scroll left"
          >
            ‹
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-5 overflow-x-auto pb-4 px-2 scroll-smooth"
            style={{ justifyContent: books.length < 6 ? "center" : "flex-start" }}
          >
            {books.map((book, i) => (
              <motion.div
                key={i}
                className="flex-shrink-0 w-[220px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <BookCard book={book} onClick={() => onBookClick(book)} />
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollBy(280)}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white shadow-lg hover:bg-black/60"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>

      </div>
    </section>
  );
};

export default RecommendationGrid;