import type { CSSProperties } from "react";

/**
 * Splits a heading into masked words that rise in sequence when an ancestor
 * `.reveal` turns `.is-in`. Rendered on the server too, so the prerendered
 * text is identical; without JS the words simply sit in place.
 */
export function SplitText({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="split-w">
            <span
              className="split-i"
              style={{ ["--i" as string]: start + i } as CSSProperties}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
