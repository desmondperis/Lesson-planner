# Lesson Planner

A browser-based lesson planning workspace for Mount Carmel School's Value Education classes. Teachers can create a lesson from a topic, scripture passage, or attached source; refine the result with AI; and export it for teaching or administration.

## What it does

- Generates age-appropriate English, Hindi, or bilingual lessons with a teacher-selected AI provider.
- Supports Gemini, OpenRouter, Groq, Mistral, Ollama, and LM Studio.
- Reads text, Word documents, PDFs, and images where the selected provider supports them.
- Saves unfinished setup automatically and keeps versioned lesson drafts.
- Stores reusable class templates and suggests related scripture.
- Exports Word, PDF, PowerPoint, Canva-ready slides, and a neutral CBSE report.
- Shares a lesson by link and supports a Google Classroom handoff.
- Works in device-only mode or syncs private app data through Google Drive.
- Installs as an app on Android phones and tablets, in either orientation.

## Project structure

The application is a single self-contained HTML file. Everything else supports installation.

```text
index.html               The entire application: markup, styles and scripts
manifest.webmanifest     Web app manifest (name, icons, orientation)
sw.js                    Service worker; network-first so a deploy is never served stale
icon-192.png             App icon
icon-512.png             App icon
icon-maskable-512.png    Android adaptive icon (safe-zone padded)
apple-touch-icon.png     iPad / iPhone home screen icon
```

There is no build step and no dependencies to install. Do not add a `<link>` to an external stylesheet or a `<script src>` for application code — keeping everything in `index.html` is deliberate, so the file can be deployed by pasting it into a single editor.

## Run locally

Serve the folder over HTTP so browser APIs and local AI providers behave consistently:

```bash
python -m http.server 4173
```

Then open <http://localhost:4173>.

Opening `index.html` directly also works for most features, but share links, the service worker, and some browser security rules are more reliable over HTTP. Installation requires HTTPS, so it will not offer to install from `localhost` over plain HTTP.

## Configuration

Edit the configuration block near the top of the script in `index.html`:

- `GOOGLE_CLIENT_ID` enables Google sign-in and Drive app-data sync. Add the deployed and local origins to the OAuth client's authorized JavaScript origins.
- `SCHOOL_NAME` controls the name shown in the interface and exported files.
- `SCHOOL_LOGO` contains the logo used by the interface and document exports.
- `YOUVERSION_APP_KEY` is optional and enables the live YouVersion catalogue.

Teachers enter their own AI service key during onboarding. In device-only mode it remains in that browser. With Google sync enabled, settings, drafts, templates, unfinished setup, and the selected service key are stored in the user's private Drive app-data folder.

## Verify changes

There is no test runner. After editing `index.html`, check that the inline script still parses:

```bash
sed -n '/^<script>$/,/^<\/script>$/p' index.html | sed '1d;$d' > /tmp/app.js && node --check /tmp/app.js
```

Then test in a browser: onboarding, a device-only reload, generating and exporting a lesson, error handling, and the mobile layout in both orientations.

If icons or the manifest change, confirm the paths in `manifest.webmanifest` and `sw.js` still match the actual filenames — a missing icon silently disables installation.

## Deployment

A static site with no build. Deploy the whole folder to Cloudflare Pages, GitHub Pages, or any static host, with an empty build command and the repository root as the output directory. All files must sit in the same directory as `index.html`.

Installation requires HTTPS. After deploying a change, reopen the app in a fresh tab so the service worker picks up the new version.
