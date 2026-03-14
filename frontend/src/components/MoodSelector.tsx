import { motion } from "framer-motion";
import { moods } from "@/data/books";

interface MoodSelectorProps {
  onSelectMood?: (mood: string) => Promise<void>;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelectMood }) => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl font-bold mb-3">Discover by Mood</h2>
        <p className="text-muted-foreground mb-8">How are you feeling today?</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {moods.map((mood, i) => (
            <motion.button
              key={mood.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectMood?.(mood.name)}
              className={`relative rounded-2xl border border-border overflow-hidden bg-gradient-to-br ${mood.gradient} p-8 text-center`}
            >
              <span className="font-display text-lg font-semibold text-foreground">{mood.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoodSelector;
