# Career Explorer

A no-build, mobile-friendly career exploration app for high-school students. It includes 18 one-at-a-time questions, deterministic weighted matching, eight Career DNA dimensions, RIASEC interests, 51 career profiles, unexpected-career suggestions, comparison, career detail pages, a guided advisor, and a two-sided A6 Career DNA card with a QR code.

## Run locally

Requires Node.js 18 or newer. No packages need to be installed.

1. Open a terminal in this folder.
2. Run `node server.js` (or `npm start`).
3. Open http://127.0.0.1:4173 in a browser.

## Privacy and scope

The assessment asks for no name or contact information. Results are stored in this browser's local storage under a random code; retrieval and the QR link work in the same browser on the same device. The app makes no external requests. The advisor is a local, profile-aware guided demo; no AI service is connected. Scores compare answers with career descriptions and are not probabilities of success or a definitive career test.

Career data is in `data/careers.json`; assessment prompts and matching, DNA, advisor, card, and UI code are kept in separate modules under `js/`.

