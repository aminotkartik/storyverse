# FIFTEEN SECONDS

### A city should not ask people to become faster. It should learn to become fairer.

**FIFTEEN SECONDS** is a self-contained, original interactive manga about Tara, her grandfather Dadu, and the everyday choices that decide who gets to use a city safely. It is designed as a story to move through—not a conventional landing page or a vertically stacked comic.

The experience moves from **observe → experience → question → discover → understand → act → change** across ten chapters. The countdown is a real 15-second interaction; the remaining chapters invite the reader to replay the same crossing at different paces, uncover street-level barriers, turn a mirror, flip Tara's notes, place a campaign poster, make civic choices, and scroll through a calmer 34-second crossing.

## Run locally

No build step, package manager, server-side code, or account is required. Serve the project directory over HTTP:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

The files use relative asset paths, so the project can also be deployed as a static site on GitHub Pages, Vercel, or any basic web host. For GitHub Pages, publish the repository root (or the `main` directory if using a deployment workflow).

## Project map

```text
/
├── index.html        semantic chapter structure and accessible controls
├── style.css         paper / ink design system, manga panels, responsive layouts
├── script.js         vanilla JavaScript interactions, sound, scroll choreography
├── assets/
│   ├── crossing-chaos.jpg   original opening intersection illustration
│   ├── look-again.jpg       original civic-evidence street illustration
│   └── crossing-calm.jpg    original, warmer return-to-the-crossing illustration
├── README.md
└── LICENSE
```

## Interaction and controls

- **BEGIN** starts the story. The opening countdown is brief and can be skipped; ambient audio is off until explicitly enabled.
- **Press the signal** to start the real 15-second Chapter 01 timer. It keeps running if you continue scrolling.
- Select a pedestrian in Chapter 02 to replay the *same* 15-second crossing at a different pace.
- Tap/click the numbered marks in Chapter 03 to uncover five civic obstacles. All markers are keyboard-operable.
- **Show me who you mean** breaks “average pedestrian” into the people the average erased.
- Scroll through Chapter 05 to rotate the mirror from “THE SYSTEM” to “US.” The mirror button is an alternative control.
- Use **Prev / Next** to turn Tara's notebook pages.
- In Chapter 07, drag the poster to the dashed notice board, or tap it (Enter/Space works too) to place it.
- In Chapter 08, choose how you would act. An inconsiderate choice shows its consequence and lets you reconsider; responsible choices reveal a chain of people who get room to move. There is no score.
- Scroll through the Chapter 09 panel to pace Dadu's crossing. It is a visual narrative control, not a second real-time countdown.
- Pick one or more small promises in Chapter 10. Notes are anonymous and stored **only in this browser/device** using local storage; there is no backend and notes are not shared between visitors.
- **P** toggles Presentation Mode and jumps to Chapter 01. **E** reloads the experience from the opening. **Escape** closes the chapter menu.
- The floating **Chapters** menu can jump directly to any chapter. The sound control toggles optional synthesized ambience/effects created with the Web Audio API; sound is never required to complete an interaction.

## Accessibility and performance

- Semantic headings/landmarks, skip link, visible focus states, keyboard-operable buttons, accessible names, and live status messages are included.
- Reduced-motion preferences are respected in CSS and JavaScript. Core content and interactions do not depend on motion or sound.
- Mobile layouts are deliberately vertical; discovery markers have touch-sized targets, the walker strip is swipeable, and the poster supports tap as well as drag.
- Images are local, compressed JPEGs with dimensions and lazy loading on non-opening scenes. There are no third-party scripts, trackers, or font requests.
- The optional soundscape uses a small Web Audio graph and starts only after the reader enables sound.

## Artwork and story

All three street illustrations were generated specifically for this project from original prompts and are used as local assets. Character and art direction are original and do not reproduce an existing manga, franchise, artist, or character design. The short crossing-time examples and Tara's tally are narrative examples—not a real-world survey or citywide statistics.

The work is intended to hold both infrastructure and everyday behavior in view: poor design, weak enforcement, normalized impatience, and collective apathy can reinforce one another. It is not a partisan statement and does not claim that individual goodwill can replace accessible infrastructure or public accountability.

## License

The source project is released under the MIT License. See [`LICENSE`](LICENSE). The artwork is included with the project under the same license for this competition deliverable.
