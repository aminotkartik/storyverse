// Artwork registry. The donor imported seven images that were not included in the
// upload; the three original illustrations from the repository root are reused here
// instead (../../assets is the storyverse/assets folder).
import crossing from "../../assets/crossing-chaos.jpg";
import street from "../../assets/look-again.jpg";
import calm from "../../assets/crossing-calm.jpg";

export const IMG = {
  crossing,
  street,
  calm,
};

export const PRELOAD = Object.values(IMG);
