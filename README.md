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

## Run locally

No build step or package installation is required. Serve the folder over HTTP so browser APIs and local AI providers behave consistently:

```bash
python -m http.server 4173
```

Then open <http://localhost:4173>.

Opening `index.html` directly also works for most features, but share links and some browser security rules are more reliable over HTTP.

## Configuration

Edit the configuration block near the top of `app.js`:

- `GOOGLE_CLIENT_ID` enables Google sign-in and Drive app-data sync. Add the deployed and local origins to the OAuth client's authorized JavaScript origins.
- `SCHOOL_NAME` controls the name shown in the interface and exported files.
- `SCHOOL_LOGO` contains the logo used by the interface and document exports.
- `YOUVERSION_APP_KEY` is optional and enables the live YouVersion catalogue.

Teachers enter their own AI service key during onboarding. In device-only mode it remains in that browser. With Google sync enabled, settings, drafts, templates, unfinished setup, and the selected service key are stored in the user's private Drive app-data folder.

## Project structure

```text
index.html       Accessible page structure and dialogs
styles.css       Responsive light/dark presentation
app.js           Planner, AI providers, persistence, exports and sharing
tests/smoke.mjs  Dependency-free structural and syntax checks
```

## Verify changes

Node.js 18 or newer is sufficient:

```bash
npm test
```

The smoke test checks JavaScript syntax, required assets and controls, duplicate HTML IDs, encoding damage, and accidental inclusion of a built-in Gemini key. For UI changes, also test onboarding, a device-only reload, error handling, and the mobile layout in a browser.

## Deployment

The repository is a static site and can be deployed directly with GitHub Pages or any static host. Serve `index.html`, `styles.css`, and `app.js` from the same directory.
