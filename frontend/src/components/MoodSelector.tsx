import { motion } from "framer-motion";
import { moods } from "@/data/books";
import { moodDiscoveryMap } from "@/lib/discovery";

interface MoodSelectorProps {
  onSelectMood?: (mood: string) => Promise<void>;
  activeMood?: string;
  loadingMood?: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  onSelectMood,
  activeMood = "",
  loadingMood = "",
}) => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl font-bold mb-3">Discover by Mood</h2>
        <p className="text-muted-foreground mb-8">How are you feeling today?</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {moods.map((mood, i) => (
            (() => {
              const config = moodDiscoveryMap[mood.name.toLowerCase()];
              const isActive = activeMood === mood.name;
              const isLoading = loadingMood === mood.name;

              return (
                <motion.button
                  key={mood.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 0.98, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={Boolean(loadingMood)}
                  onClick={() => onSelectMood?.(mood.name)}
                  className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 text-left transition ${
                    isActive || isLoading
                      ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/40"
                      : "border-border"
                  } ${mood.gradient} ${loadingMood && !isLoading ? "opacity-60" : ""}`}
                >
                  <div className={`absolute inset-0 ${isLoading ? "bg-black/5" : "bg-black/15"}`} />
                  <div className="relative">
                    <span className="font-display text-lg font-semibold text-foreground">
                      {isLoading ? `Finding ${mood.name} reads...` : mood.name}
                    </span>
                    <p className="mt-2 min-h-[3rem] text-sm text-foreground/80">
                      {isLoading
                        ? "Please wait while we build your mood shelf."
                        : config?.subjects.slice(0, 2).join(" • ") || "Curated discovery"}
                    </p>
                  </div>
                </motion.button>
              );
            })()
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoodSelector;
