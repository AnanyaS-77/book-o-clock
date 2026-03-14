import { motion } from "framer-motion";
import type { Book } from "@/data/books";

interface BookCardProps {
  book: Book;
  compact?: boolean;
  onClick?: (book: Book) => void;
}

const BookCard = ({ book, compact = false, onClick }: BookCardProps) => {
  const handleBuy = () => {
    const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(book.title)}`;
    window.open(url, "_blank");
  };

  const handleRead = () => {
    const url = `https://archive.org/search?query=${encodeURIComponent(book.title)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 hover:scale-[1.05] hover:shadow-xl hover:border-primary"
    >
      <div
        onClick={() => onClick(book)}
        className="cursor-pointer hover:scale-[1.03] transition-transform duration-200"
      >
      <div className="relative overflow-hidden aspect-[2/3]">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground truncate">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{book.author}</p>

        {!compact && (
          <div className="flex gap-2">
            <button
              onClick={handleBuy}
              className="flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Buy Book
            </button>
            <button
              onClick={handleRead}
              className="flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
            >
              Read Online
            </button>
          </div>
        )}

        {compact && (
          <div className="flex gap-2">
            <button
              onClick={handleBuy}
              className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Buy
            </button>
            <button
              onClick={handleRead}
              className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
            >
              Read
            </button>
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
