import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { books, type Book } from "@/data/books";

interface Props {
  onBookClick?: (book: Book) => void;
}

const featuredBooks = books.filter((book) => book.featured);

const FeaturedBanner = ({ onBookClick }: Props) => {
  const [current, setCurrent] = useState(0);
  const [resolvedCovers, setResolvedCovers] = useState<Record<string, string>>({});
  const featured = featuredBooks;

  if (featured.length === 0) {
    return null;
  }

  const next = () => setCurrent((c) => (c + 1) % featured.length);
  const prev = () => setCurrent((c) => (c - 1 + featured.length) % featured.length);

  const book = featured[current];
  const activeCover = resolvedCovers[book.id] || book.cover;

  useEffect(() => {
    let isCancelled = false;

    const fetchFeaturedCovers = async () => {
      const coverEntries = await Promise.all(
        featured.map(async (featuredBook) => {
          try {
            const query = encodeURIComponent(
              `intitle:${featuredBook.title} inauthor:${featuredBook.author}`
            );
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`
            );

            if (!response.ok) {
              return null;
            }

            const data = await response.json();
            const info = data.items?.[0]?.volumeInfo;
            let cover =
              info?.imageLinks?.large ||
              info?.imageLinks?.medium ||
              info?.imageLinks?.thumbnail;

            if (!cover) {
              return null;
            }

            if (cover.startsWith("http://")) {
              cover = cover.replace("http://", "https://");
            }

            return [featuredBook.id, cover] as const;
          } catch (error) {
            console.error("Error loading featured cover:", error);
            return null;
          }
        })
      );

      if (isCancelled) {
        return;
      }

      const nextResolvedCovers = coverEntries.reduce<Record<string, string>>((acc, entry) => {
        if (entry) {
          acc[entry[0]] = entry[1];
        }
        return acc;
      }, {});

      setResolvedCovers(nextResolvedCovers);
    };

    fetchFeaturedCovers();

    return () => {
      isCancelled = true;
    };
  }, [featured]);

  return (
    <section className="py-16 px-6">
      <h2 className="font-display text-3xl font-bold mb-8 max-w-7xl mx-auto">Featured Books</h2>

      <div className="relative max-w-7xl mx-auto rounded-2xl overflow-hidden bg-card border border-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12"
          >
            <div className="w-48 md:w-64 flex-shrink-0">
              <img
                src={activeCover}
                alt={book.title}
                className="w-full rounded-xl shadow-2xl"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== book.cover) {
                    target.src = book.cover;
                  }
                }}
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-glow-purple mb-4">
                {book.genre}
              </span>
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-2">{book.title}</h3>
              <p className="text-muted-foreground mb-2">by {book.author}</p>
              <p className="text-secondary-foreground max-w-lg mb-6">{book.description}</p>
              <button
                onClick={() => onBookClick?.({ ...book, cover: activeCover })}
                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Explore Book
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-secondary/80 backdrop-blur border border-border hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-secondary/80 backdrop-blur border border-border hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex justify-center gap-2 pb-6">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
