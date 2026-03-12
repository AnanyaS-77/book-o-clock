import { motion } from "framer-motion";
import BookCard from "./BookCard";

interface Book {
  title: string;
  cover: string;
}

interface Props {
  books: Book[];
}

const RecommendationGrid = ({ books }: Props) => {

  if (!books || books.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">

        <h2 className="font-display text-3xl font-bold mb-8">
          Recommended for You
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">

          {books.map((book, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default RecommendationGrid;