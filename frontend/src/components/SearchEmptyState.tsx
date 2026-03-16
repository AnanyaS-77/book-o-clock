import { SearchX } from "lucide-react";

interface SearchEmptyStateProps {
  query: string;
}

const SearchEmptyState = ({ query }: SearchEmptyStateProps) => {
  if (!query.trim()) {
    return null;
  }

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-dashed border-border bg-card/60 px-8 py-14 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <SearchX className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">No close matches found</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          We couldn&apos;t find recommendations for <span className="text-foreground">{query}</span>.
          Try a different title, an author name, or a broader genre like
          {" "}thriller, romance, or fantasy.
        </p>
      </div>
    </section>
  );
};

export default SearchEmptyState;
