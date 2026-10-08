import { Fragment } from "react";

/**
 * Plus Jakarta Sans sets wide space before , . ? ! at display sizes, which
 * reads as "move , with". This tucks trailing punctuation in by 0.06em.
 * Use for Display XL / L headlines only; body text needs no help.
 */
export function DisplayText({ children }: { children: string }) {
  const parts = children.split(/(?<=\p{L})([,.!?;:])/u);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="display-punct">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
