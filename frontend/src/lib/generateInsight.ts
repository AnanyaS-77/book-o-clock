import type { SavedBook } from "@/lib/library";

const themeMatchers = [
  { pattern: /identity|self|becom|who (?:she|he|they|we) (?:is|are)|reinvent/i, label: "identity and self-discovery" },
  { pattern: /grief|loss|mourning|heartbreak/i, label: "grief and emotional healing" },
  { pattern: /family|mother|father|sister|brother|daughter|son/i, label: "family bonds and personal history" },
  { pattern: /friendship|friends?|companionship/i, label: "friendship and human connection" },
  { pattern: /love|romance|relationship|marriage/i, label: "love and complicated relationships" },
  { pattern: /mystery|secret|hidden|disappear|unsolved/i, label: "secrets waiting to be uncovered" },
  { pattern: /survival|escape|danger|war|fight|battle/i, label: "survival under pressure" },
  { pattern: /power|control|politic|society|system/i, label: "power, control, and social pressure" },
  { pattern: /memory|past|forgotten|history/i, label: "memory and the pull of the past" },
  { pattern: /magic|myth|legend|curse|spell/i, label: "wonder with a mythic edge" },
  { pattern: /future|technology|science|space|robot/i, label: "big ideas about the future" },
  { pattern: /justice|crime|moral|truth|investigat/i, label: "moral tension and the search for truth" },
];

const genreHooks: Record<string, string> = {
  fantasy: "an immersive world and a sense of wonder",
  "science fiction": "idea-driven storytelling with imaginative stakes",
  sci: "idea-driven storytelling with imaginative stakes",
  thriller: "tight tension and a story that keeps pulling you forward",
  mystery: "smart reveals and the thrill of piecing things together",
  romance: "emotional payoff and chemistry that feels earned",
  horror: "unease, atmosphere, and psychological tension",
  literary: "character depth and language that lingers",
  historical: "rich setting and the feeling of stepping into another era",
  nonfiction: "clear takeaways and ideas worth carrying with you",
  memoir: "personal reflection that still feels broadly relatable",
  contemporary: "emotionally grounded conflicts and recognizable human stakes",
  classic: "timeless questions wrapped in memorable storytelling",
  "young adult": "strong emotional momentum and coming-of-age energy",
};

const toneMatchers = [
  { pattern: /hope|hopeful|uplift|healing/i, label: "a hopeful emotional arc" },
  { pattern: /dark|haunt|ominous|terrify/i, label: "a darker atmosphere" },
  { pattern: /funny|witty|humor|charming/i, label: "a lighter, more charming tone" },
  { pattern: /twist|shocking|suspense|tense/i, label: "plenty of tension and momentum" },
  { pattern: /quiet|tender|intimate/i, label: "an intimate, reflective mood" },
];

const toSentenceList = (items: string[]) => {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

const getGenreHook = (genre?: string) => {
  const normalizedGenre = genre?.toLowerCase() ?? "";
  return (
    Object.entries(genreHooks).find(([key]) => normalizedGenre.includes(key))?.[1] ??
    "strong atmosphere and a clear sense of what makes the story distinctive"
  );
};

const getMatchedLabels = (
  source: string,
  matchers: Array<{ pattern: RegExp; label: string }>,
  limit: number
) => {
  return matchers
    .filter(({ pattern }) => pattern.test(source))
    .map(({ label }) => label)
    .slice(0, limit);
};

export const generateInsight = (book: Pick<SavedBook, "title" | "genre" | "description" | "pages">) => {
  const description = book.description?.trim() ?? "";
  const genre = book.genre?.trim() || "book";
  const normalizedDescription = description.toLowerCase();
  const themes = getMatchedLabels(normalizedDescription, themeMatchers, 2);
  const tones = getMatchedLabels(normalizedDescription, toneMatchers, 1);
  const genreHook = getGenreHook(book.genre);
  const pageNote =
    typeof book.pages === "number" || /^\d+$/.test(String(book.pages ?? ""))
      ? Number(book.pages) > 450
        ? "It also looks like the kind of story you can really live in for a while."
        : "It looks approachable enough to sink into quickly without losing depth."
      : "";

  if (!description) {
    return `If you enjoy ${genre.toLowerCase()} reads with ${genreHook}, this one looks like an easy recommendation. ${pageNote || "It should appeal to readers who want a strong mood and a story that feels thoughtfully shaped."}`;
  }

  const themePhrase = themes.length > 0 ? toSentenceList(themes) : "character tension and emotional payoff";
  const tonePhrase = tones[0] ? ` with ${tones[0]}` : "";

  return `This ${genre.toLowerCase()} pick feels geared toward readers who like ${themePhrase}${tonePhrase}, not just surface-level plot. It promises ${genreHook}, which makes it a strong match if you want a story that gives you something to feel and think about. ${pageNote}`.trim();
};
