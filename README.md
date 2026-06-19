# AI Interview Preparation Assistant

A highly polished, responsive, and fully offline-capable web application to generate tailored interview preparation kits instantly. Built purely using **HTML, CSS, and Vanilla JavaScript**, it communicates directly with Google's native **Gemini AI API** on the client-side, making it fully portable and functional by simply double-clicking `index.html`.

---

## 🌟 Key Features

1. **Aesthetic Light & Dark Interface**: Fluid themes using deep-midnight blues and soft slate colors, adapting to device preferences with manual override.
2. **Interactive Personas Builder**: Takes Candidate Name, Job Role, and Choose-Your-Own experience milestones (Fresher, Intermediate, Experienced) to personalize responses.
3. **Role Suggestions Engine**: Instant floating tags allow candidate job targets to be populated with a single tap.
4. **Interactive Accordion UI**: Renders the 10 custom interview questions, dynamic category highlights, and expandable modern "model answer" previews.
5. **Progress checklist tracker**: Dynamic prep-tips checklist lets users mark off items as completed, checking off accomplishments before entering the room.
6. **Robust JSON parser**: Safeguards and cleans returned content even when API blocks contain markdown backticks (` ```json `) or extraneous greetings.
7. **Document Exporters**:
   - **Markdown Copies**: One-touch clipboard copier formatting the prep-kit nicely.
   - **Markdown Downloads**: Generates and downloads native file outputs (`.md`) formatted for Obsidian, Notion, or local readers.
8. **Toast Notifications drawer**: Delivers professional micro-toasts detailing completed actions.
9. **No Complex Pipelines Needed**: Operates without React, Node.js, npm, or any framework requirements.

---

## 📂 File Architecture

The codebase contains exactly four unified assets:
- `index.html`: The markup foundation. Exposes configuration selectors, progress loading modals, and the dashboard grids.
- `style.css`: Houses high-impact transitions, smooth accordions max-height stylings, custom scrollbar tracks, and floating animations.
- `script.js`: Core system logic. Manages themes, event bindings, direct Gemini API communication, fail-soft JSON parsing, and doc compilers.
- `README.md`: Explains architecture, local setup instructions, and details.

---

## ⚡ How to Run

There are two primary modes to run this template:

### Method 1: Portable Local Opening (Direct file)
Since all styles, packages, and frameworks are compiled from browser CDNs, you can open and run this application on any system without compiling or setting up node pipelines:
1. Locate `/index.html` in your directory.
2. **Double-click index.html** to launch it directly inside your default web browser (e.g., Chrome, Safari, Edge).
3. Tap **"Configure Key"** in the top navigation panel, input your secure Google Gemini API key, and select **"Apply Changes"**.
4. Input your Name and Job Target, and generate your kit!

### Method 2: Serving locally (Vite Environment)
If you are inside our development repository workspace, run:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your browser. The environment's injected API key (`process.env.GEMINI_API_KEY`) is automatically forwarded to the preview window, allowing you to run, test, and generate Kits without manually copying keys!

---

## 🔑 How to get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in using your standard Google user account credentials.
3. Click on the blue **"Get API key"** trigger at the top-left section.
4. Click **"Create API key"**, select or create an associated Google Cloud Platform project, and copy your newly-minted API token.
5. Paste it directly into the **"Configure Key"** modal drawer in our website!

---

## 🔒 Security Practices

- **Zero database pipelines**: Your Gemini API key is cached exclusively inside your client sandbox's `localStorage` context.
- **Direct API connection**: Requests are sent directly from your browser to Google Generative Language endpoints (`generativelanguage.googleapis.com`). No intermediary servers compile, store, or witness your passwords, secrets, or candidate inputs.
