const encodeSvg = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const pickAccent = (title: string) => {
  const accents = [
    ["#1d4ed8", "#60a5fa"],
    ["#7c3aed", "#c084fc"],
    ["#be123c", "#fb7185"],
    ["#0f766e", "#5eead4"],
    ["#b45309", "#fbbf24"],
    ["#166534", "#86efac"],
  ];

  const hash = Array.from(title).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return accents[hash % accents.length];
};

export const getFallbackCover = (title: string, author?: string) => {
  const [primary, secondary] = pickAccent(title);
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeAuthor = (author || "Book O' Clock")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <defs>
        <linearGradient id="coverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" rx="28" fill="#09090b" />
      <rect x="18" y="18" width="364" height="564" rx="22" fill="url(#coverGradient)" />
      <rect x="40" y="44" width="320" height="512" rx="18" fill="rgba(10, 10, 14, 0.58)" />
      <circle cx="308" cy="106" r="70" fill="rgba(255,255,255,0.08)" />
      <circle cx="118" cy="486" r="92" fill="rgba(255,255,255,0.06)" />
      <text x="42" y="110" fill="rgba(255,255,255,0.72)" font-family="Georgia, serif" font-size="18" letter-spacing="5">
        BOOK O' CLOCK
      </text>
      <foreignObject x="42" y="150" width="316" height="250">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color:#fff;font-family:Georgia, serif;font-size:36px;line-height:1.15;font-weight:700;">
          ${safeTitle}
        </div>
      </foreignObject>
      <text x="42" y="518" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="22">
        ${safeAuthor}
      </text>
    </svg>
  `;

  return encodeSvg(svg);
};

export const normalizeCoverUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }

  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

export const getOpenLibraryCover = (isbn?: string | null) => {
  if (!isbn) {
    return null;
  }

  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
};

interface ResolveCoverOptions {
  title: string;
  author?: string;
  primaryCover?: string | null;
  isbn?: string | null;
}

export const resolveBookCover = ({
  title,
  author,
  primaryCover,
  isbn,
}: ResolveCoverOptions) => {
  return normalizeCoverUrl(primaryCover) || getOpenLibraryCover(isbn) || getFallbackCover(title, author);
};

export const applyFallbackCover = (
  event: { currentTarget: HTMLImageElement },
  title: string,
  author?: string
) => {
  const fallbackCover = getFallbackCover(title, author);

  if (event.currentTarget.src !== fallbackCover) {
    event.currentTarget.src = fallbackCover;
  }
};
