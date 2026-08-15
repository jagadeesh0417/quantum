# Images

This site is a **static asset drop-in**: every page references images by exact filename.

1. Generate images from the prompt pack at the repo root: `PROMPTS.md`.
2. Save each `.jpg` into the matching folder below with the exact filename.
3. Delete the `.gitkeep` files in folders you fill.
4. Run the local check (or ask the agent) to verify every reference resolves, then deploy.

## Folders

- `hero/` — full-width hero banners (10 files: hero-home.jpg … hero-contact.jpg)
- `gallery/` — gallery tiles (gallery-01.jpg … gallery-20.jpg)
- `services/` — division card bands (svc-01.jpg … svc-08.jpg)
- `programs/` — programme card bands (prg-01.jpg … prg-06.jpg)
- `wellness/` — wellness journey card bands (wl-01.jpg … wl-10.jpg)
- `resort/` — resort tour card bands (rt-01.jpg … rt-14.jpg)
- `about/` — about page band (ab-vision-01.jpg)
- `index/` — homepage panels (campus-01.jpg, vision-01.jpg)
- `therapy/` — optional topic images (th-01.jpg … th-18.jpg)
- `stem-cell/` — optional images (sc-01.jpg … sc-04.jpg)
- `leadership/` — founder portrait 4:5 (vs-01.jpg, pk-01.jpg, dt-01.jpg, sd-01.jpg, ak-01.jpg)

Missing files fall back to the existing brand gradients — no blank space, no broken layout.
