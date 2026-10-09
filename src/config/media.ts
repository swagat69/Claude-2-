/**
 * Photos and logos that only DFX can supply (brief H0.3, H0.8, §11: real
 * people and authorised logos only, never stock or generated faces). Each
 * slot is null or empty until DFX provides the file; the page then shows a
 * labelled placeholder of the same size, so the layout doesn't change when
 * the real file arrives. Put files in /public/media and fill in the slot.
 */

export interface PhotoAsset {
  /** Path under /public, e.g. "/media/team.jpg". */
  src: string;
  /** What the photo shows, for screen readers, e.g. "Two DFX loan specialists in the Singapore office". */
  alt: string;
  width: number;
  height: number;
}

export interface LogoAsset {
  name: string;
  /** SVG or PNG under /public, ideally one colour on transparent. */
  src: string;
  width: number;
  height: number;
}

export const media = {
  /** Homepage support section: the team, or the person people will speak to. Portrait, about 4:5. */
  supportPhoto: null as PhotoAsset | null,
  /** Headshot of the person who takes calls, shown beside the call invitation. Square. */
  specialistPhoto: null as PhotoAsset | null,
  /** Lenders DFX has written permission to name. Empty: the strip shows placeholders. */
  lenderLogos: [] as LogoAsset[],
  /** How many logo spaces to hold open until the real logos arrive. */
  lenderLogoSlots: 5,
};
