# Career Explorer

A self-contained, anonymous career exploration app for students. No build step or account is required.

## Run it

Open `index.html` in a modern browser. For reliable code storage, serve this folder from a local web server (for example, run `python -m http.server 8000` from this folder, then open `http://localhost:8000`).

## What is included

- 18 one-at-a-time assessment questions across interests, strengths, work values and academic interests
- 50 structured career records in `careers.js`
- Deterministic Compatibility / Exploration Scores with the weights shown on the results page
- Career DNA profile, top five recommendations, and unexpected career suggestions
- Career guides, two- or three-career comparison, profile-aware advisor demo, and printable card
- Random anonymous code and on-device QR generation

## Privacy and demo notes

Assessment results are stored in browser local storage. A code can retrieve its result in the same browser profile where the assessment was completed; there is no server-side sync. The QR code contains the anonymous code (not personal data or a hosted result link).

The advisor is a local, rule-based demonstration and does not call an external AI service. It uses the saved profile and career catalog to answer a small set of exploration prompts. The app is an exploration aid, not a definitive test or professional counselling.

