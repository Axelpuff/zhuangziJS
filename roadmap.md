Here’s a compact roadmap that fits your constraints and splits cleanly into **Presentation** vs **Final Submission**, assuming:

* **Stack:** plain HTML + JS + Three.js via CDN (no bundler).
* **Structure:** one main interactive page + maybe a tiny “About / Instructions” section on the same page.
* **Data:** a `philosophers.js` file exporting an array of objects (id, name, school, color, roles, layouts, quotes, etc.).
* **Showcase philosophers for the demo:** **Mencius** and **Xunzi**.
* **Sound:** simple but real (ambient loop + a couple of interaction sounds).
* **Target:** ~15 hours total (try to keep the build around ~10–11h and reserve ~4–5h for content + write-up).

---

## Overall Structure (very brief)

* `index.html` — canvas + overlay UI.
* `style.css` — basic layout.
* `main.js` — scene setup, rendering, interaction.
* `philosophers.js` — data about thinkers (positions, colors, key terms, relationships, quotes).
* `assets/` — zither model, textures, audio, image fragments.

---

## Phase 1 – Foundations (Pre-presentation)

### 1. Spec + data design (0.5–1h) – **Pre-presentation**

**Goal:** Lock the scope so you don’t overbuild.

Tasks:

* Decide minimal set of properties for each philosopher in `philosophers.js`:

  * `id`, `name`, `chineseName`, `school`, `color`, `major/minor`, `basePosition` (on strings), `focusLayouts` (only Mencius/Xunzi for now), `keyTerms`, `oneQuote`, `relationships` (e.g. “opposes”, “borrows from”).
* Roughly sketch how:

  * **Mencius view** → Mencius above, Mohists + Yangists in “duel” configuration.
  * **Xunzi view** → Confucius at center, others as “fixated” orbs in a sphere.
* Decide color palette per school (you mostly have this already).

### 2. Basic project setup + scene (1.5–2h) – **Pre-presentation**

**Goal:** A static but working 3D scene.

Tasks:

* Create GitHub repo.
* Simple `index.html`:

  * `<canvas>` or a div that Three.js will use.
  * A tiny overlay: title, one-line instructions (“click an orb to change perspectives”).
* Add Three.js via `<script type="module" src="https://unpkg.com/three@.../build/three.module.js">` or similar.
* `main.js`:

  * Create renderer, scene, camera, resize handler, basic animation loop.
  * Add simple camera controls (OrbitControls).
  * Add a few lights (directional + ambient).
* Load the **zither model** via `GLTFLoader` and position it as the “floor”.
* Add a few test spheres to confirm sizing & camera feels good.

### 3. Orbs + base timeline layout (2h) – **Pre-presentation**

**Goal:** All philosophers appear as colored orbs on a zither-like timeline.

Tasks:

* Implement `philosophers.js` with **all thinkers** roughly filled in (can stub text).
* In `main.js`:

  * For each philosopher, create a sphere with the right color and a small glow/fresnel-ish material if easy; otherwise just emissive.
  * Position them using `basePosition` (aligned along imaginary “strings” over the zither).
* Add simple “string” visuals:

  * A few thin cylinders/lines parallel to the zither to suggest strings.
* Overlay UI:

  * On hover/click, show the philosopher’s **name** in a small top-left or bottom overlay.
* Implement raycasting to pick orbs with mouse click.

* **Complete:** 11/30 4:30 PM

### 4. Mencius perspective (1.5–2h) – **Pre-presentation**

**Goal:** First impressive “rearrange the field” interaction.

Tasks:

* Add a `setPerspective(philosopherId)` function.
* For **Mencius**:

  * Define a `focusLayouts.mencius` entry in `philosophers.js` with target positions.
  * On click:

    * Animate Mencius up and central.
    * Move **Mohists and Yangists** into a visible “duel”: maybe two clusters at left and right, below him.
    * Push later philosophers back in z (fade/scale down).
* Basic animation:

  * Use simple interpolation in your render loop (lerp toward target positions) instead of adding a full animation library.
* UI:

  * Bottom panel: big **孟子 / Mèngzǐ**, key terms (e.g. xing, sprouts, human nature), and 1–2 sentence blurb.

* Code should be in main.js, with minor modifications in philosophers.js for target positions
1. Refactor global state to hold focus/unfocused state and focused philosopher
  * (Perhaps a hover_focus state as well)
  * Need a transition bool to prevent normal interactions when state is changing
2. On clicking Mencius, transitioning = true, focus = true, move relevant orbs (Mencius, Confucius, Mozi, Gaozi, Yang Zhu) into position in center, other orbs disappear
3. Pane shows up on right side with information
4. Keywords show up on left
5. X button on top right of pane that goes back to neutral view

Scope restrictions:
* For now, panels are just plain gray with white text

Stop at 6:30 to get dinner - 1 hour after that, should be done
* Ended up taking much more time: until 10:20, without the proper orb rearrangements

### 5. Xunzi perspective (1.5–2h) – **Pre-presentation**

**Goal:** Second distinctive interaction to contrast with Mencius.

Tasks:

* Add `focusLayouts.xunzi`.
* On click Xunzi:

  * Fix Confucius orb at center.
  * Place all other orbs on a spherical shell around Confucius (precomputed positions in `philosophers.js` or generated on the fly).
  * Add very slow rotation of that “sphere of fixations”.
* UI:

  * Bottom panel: **荀子 / Xúnzǐ**, key terms, short blurb explaining “extreme fixations” and Confucius as balanced center.

### 6. Minimal sound design (1–1.5h) – **Pre-presentation**

**Goal:** Enough sound to feel intentional and thematic.

Tasks:

* Put 1–2 audio files in `assets/audio/`:

  * A calm **zither loop** for background.
  * Optional short pluck/chime for orb click.
* In JS:

  * Simple `Audio` objects or Web Audio (keep it basic).
  * Start loop on first user interaction (click anywhere).
  * On philosopher click: play pluck and maybe briefly boost volume or filter.
* Keep it subtle: no mixing engine, just a couple of sounds.

### 7. Presentation polish (0.5–1h) – **Pre-presentation**

**Goal:** Demo-ready, clearly scoped.

Tasks:

* Add a small **legend**: color → school.
* In UI, clearly mark: “Only **Mencius** and **Xunzi** have full visual perspectives; others coming in final version.”
* Ensure:

  * Camera starts at a flattering angle.
  * Controls can’t get too crazy (limit zoom and polar angle).
* Prepare a short demo script: 1) show base view, 2) click Mencius, 3) click Xunzi, 4) return to base.

---

## Phase 2 – Final Submission

### 8. Content completion & per-text visuals (3–4h) – **Final**

**Goal:** All thinkers have meaningful content + at least a modest visual shift.

Tasks:

* Fill `philosophers.js` with:

  * 1 short quote each.
  * 2–3 key terms and how they use them.
  * Very brief description of how they see other thinkers or antiquity (even if not fully visualized).
* For **non-showcase philosophers**:

  * On click, re-use the base layout but:

    * Highlight them (scale up, increase emissive, halo).
    * Push closely related figures slightly forward or closer.
    * Fade less-relevant ones.
  * Update bottom panel with their terms & quote.
* This keeps logic simple while still honoring “per-text orb visuals.”

### 9. Historical textures & images (1–2h) – **Final**

**Goal:** Integrate authentic-feeling images without complex 3D work.

Tasks:

* Add a small image area in the bottom/right overlay.
* For each philosopher, specify 1–2 images in `philosophers.js`:

  * Rubbings, bronzes, bamboo slips, etc. (static JPG/PNG).
* On click, update the image panel accordingly.
* Optional: subtle fade-in effect using CSS.

### 10. Sound refinement (0.5–1h) – **Final (optional)**

**Goal:** Slightly deepen the harmony/dissonance theme.

Tasks (only if time remains):

* Change background loop or add a gentle filter when:

  * You’re in Mencius vs Xunzi view (e.g. a more “tense” variant for Xunzi, more “open” for Mencius).
* This can be as simple as swapping loops or adjusting volume/EQ.

### 11. Final polish + write-up (2–3h) – **Final**

**Goal:** Make it coherent philosophically and technically.

Tasks:

* Code/UX:

  * Check performance on a basic laptop.
  * Check that the site looks okay at common resolutions.
  * Ensure tooltips/text don’t overlap awkwardly.
* **Write-up / reflection:**

  * Explain central theme (no neutral vantage point; Zhuangzi).
  * Describe how the site uses:

    * Perspective switching (Mencius vs Xunzi vs others),
    * Colors and layout,
    * Sound (harmony/dissonance),
    * Historical images.
  * Emphasize that the project foregrounds relations between thinkers, not isolated doctrines.

---

## Time Budget (rough, to stay under ~15h)

* Foundations & demo (Phases 1–7): ~8–9h
* Final additions (Phases 8–11): ~5–6h
  → **Total:** ≈13–15h including write-up, if you stick to “simple first” for visuals and sound.

If you’d like, next step I can help you draft:

* A **minimal `philosophers.js` schema**, or
* A **skeleton `index.html` + `main.js`** to start coding immediately.
