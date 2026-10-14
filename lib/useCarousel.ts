"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Index state for a gallery, with arrow-key navigation.
 *
 * The listener is global on purpose — a gallery you are looking at should
 * answer the arrow keys without being focused first. It steps aside when a
 * modifier is held, when focus is in a field, or when a dialog is open, so it
 * never eats a shortcut or fights the lightbox.
 *
 * ## Only the gallery you are looking at
 *
 * Every gallery on the page installs the same listener, so without a referee
 * one key press stepped all of them at once — paging the kits also paged the
 * renders four screens below. Each gallery marks its own box with
 * `data-carousel` and names it by id, and on a key press the one most on
 * screen takes it; the rest ignore it. A gallery barely in view never
 * answers, so the keys do nothing between stations rather than moving
 * something out of sight.
 */
export interface Carousel {
  index: number;
  select: (next: number) => void;
  next: () => void;
  previous: () => void;
}

/**
 * The gallery most on screen, if any is meaningfully in view.
 *
 * A third of the gallery — or of the screen, for one taller than it — has to
 * be visible. Merely touching the viewport is not enough: on a phone the kits
 * section's top padding already shows at the foot of the intro, and the left
 * and right keys there would have paged a gallery nobody could see.
 */
function focusedGallery(): Element | null {
  let best: Element | null = null;
  let bestVisible = 0;
  for (const gallery of document.querySelectorAll("[data-carousel]")) {
    const rect = gallery.getBoundingClientRect();
    const visible =
      Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    const needed = Math.min(rect.height, window.innerHeight) / 3;
    if (visible >= needed && visible > bestVisible) {
      best = gallery;
      bestVisible = visible;
    }
  }
  return best;
}

/**
 * @param galleryId The `id` of the gallery's box, which must also carry
 *   `data-carousel`. It is what decides which gallery a key press is for.
 */
export function useCarousel(
  count: number,
  galleryId: string,
  enabled = true,
): Carousel {
  const [index, setIndex] = useState(0);

  const select = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => select(index + 1), [index, select]);
  const previous = useCallback(() => select(index - 1), [index, select]);

  useEffect(() => {
    if (!enabled || count < 2) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;
      // Never steal a key from a field, a modal, or a scrollable widget.
      if (document.querySelector("dialog[open]")) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        (active.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName))
      ) {
        return;
      }
      // Another gallery is the one in view.
      const gallery = document.getElementById(galleryId);
      if (!gallery || focusedGallery() !== gallery) return;
      event.preventDefault();
      setIndex((current) => {
        const step = event.key === "ArrowRight" ? 1 : -1;
        return (((current + step) % count) + count) % count;
      });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, galleryId, enabled]);

  return { index, select, next, previous };
}
