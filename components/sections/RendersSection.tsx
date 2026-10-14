"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProjectCopy, RenderGallery, Station } from "@/types/project";
import AssetFrame from "@/components/ui/AssetFrame";
import Lightbox from "@/components/ui/Lightbox";
import ZoomableAsset from "@/components/ui/ZoomableAsset";
import CarouselControls from "@/components/ui/CarouselControls";
import StationHeader from "./StationHeader";
import StationPanel from "@/components/layout/StationPanel";
import { useCarousel } from "@/lib/useCarousel";

/**
 * Station 4 — the renders.
 *
 * The picture and the position in the sequence, and nothing else.
 *
 * Each render used to carry a title, the view it was shot from and the board
 * it depicted — "Terminus novelty", "Detail", "Novelty, 1u" — beneath the
 * render that showed all three. Naming what the reader is already looking at
 * adds a line to read and a thing to keep true.
 *
 * The credit is the gallery's, not the item's, because it is the same hand
 * every time; it sits under the frame and does not change as you page. The
 * board does change, and is the one thing about a render the picture does not
 * tell you — so it sits opposite the credit, smaller, and is simply absent on
 * a render whose board is not known yet.
 *
 * No pills either: with nothing to name them, they would have read 01 to 05
 * beneath a counter already reading 01 / 05. Arrows, the counter and the
 * arrow keys are the whole control.
 *
 * The lightbox is where a render is actually judged, so it opens at fit and
 * toggles to 100% on click.
 */

/** Pure opacity, no travel — anything else would reintroduce reflow. */
const FADE = { duration: 0.2, ease: "easeOut" } as const;

export interface RendersSectionProps {
  renders: RenderGallery;
  station: Station;
  copy: ProjectCopy;
}

export default function RendersSection({
  renders,
  station,
  copy,
}: RendersSectionProps) {
  const [open, setOpen] = useState(false);

  // `order` is the authored sequence and the only thing deciding position.
  const items = useMemo(
    () => [...renders.items].sort((a, b) => a.order - b.order),
    [renders.items],
  );

  const carousel = useCarousel(items.length, "renders");

  if (items.length === 0) return null;

  const item = items[carousel.index];
  const pad = (n: number) => String(n).padStart(2, "0");
  const position = `${pad(carousel.index + 1)} / ${pad(items.length)}`;

  return (
    <section
      id="renders"
      data-carousel
      className="relative py-12 lg:py-[45vh]"
    >
      <StationPanel routeSide="right">
        <StationHeader station={station} />

        <figure>
          {/* Square, and the full width of the card, breaking out through
            the padding. The renders are exported 1:1, so the frame is 1:1 and
            they fill it edge to edge — 825px against the 707 a 7:6 frame left
            them once it had letterboxed a square.

            It contains rather than crops, unlike the kits. The shapes agree
            today, so contain and cover are the same picture; if one arrives in
            another shape it will be letterboxed rather than cut, which is the
            right way round for a gallery whose whole subject is the artwork.
            One of these is a tight detail with the caps at the frame edge and
            has nothing to spare. */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-line-primary lg:-mx-12 lg:w-[calc(100%+6rem)]"
            aria-label={`${copy.labels.zoomIn} — ${renders.heading} ${position}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE}
                className="absolute inset-0"
              >
                <AssetFrame
                  asset={item.asset}
                  tag={position}
                  placeholderLabel={copy.labels.assetPlaceholder}
                  className="transition-opacity group-hover:opacity-85"
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  priority={carousel.index === 0}
                />
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Board on the left, credit on the right. Stacked below `sm`,
            where the two do not fit on one line — and the stack is given the
            height of both lines whether or not the board is there, so paging
            onto a render without one does not shift the controls. */}
          <figcaption className="mt-6 w-full border-t-2 border-ink/25 pt-3">
            {/* Board first, in the order it is read: `flex-row-reverse`
              would have put it on the left visually while leaving it second
              in the document, which is the sort of thing only a screen reader
              notices and only ever notices as wrong. */}
            <div className="flex min-h-[2.25rem] flex-col justify-start gap-1 sm:min-h-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              {item.board ? (
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink/45">
                  {item.board}
                </p>
              ) : null}

              {renders.credit ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
                  {copy.labels.credit}: {renders.credit}
                </p>
              ) : null}
            </div>
          </figcaption>
        </figure>

        <CarouselControls
          carousel={carousel}
          count={items.length}
          copy={copy}
        />

        <Lightbox
          open={open}
          onClose={() => setOpen(false)}
          closeLabel={copy.labels.close}
          title={renders.heading}
          meta={position}
          caption={item.asset.caption}
        >
          <ZoomableAsset asset={item.asset} tag={position} copy={copy} />
        </Lightbox>
      </StationPanel>
    </section>
  );
}
