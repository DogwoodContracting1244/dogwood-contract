# Dogwood Exteriors Contract App (PWA)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally (for testing)
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

### 3. Build for Production
```bash
npm run build
```
This creates a `dist/` folder with everything you need.

---

## Deploy to Vercel (Free & Easiest)

1. Go to https://vercel.com and sign up with GitHub
2. Push this project folder to a GitHub repository
3. In Vercel, click "New Project" → Import your repo
4. It auto-detects Vite — just click "Deploy"
5. You'll get a URL like `https://dogwood-contract.vercel.app`

That's it! The PWA will work immediately.

---

## Deploy to Netlify (Also Free)

1. Go to https://netlify.com and sign up
2. Drag and drop the `dist/` folder (after running `npm run build`)
3. Done — you get a URL instantly

---

## Installing on Phones

### Android
1. Open the URL in Chrome
2. Tap the three dots menu (⋮) → "Add to Home screen"
3. It installs like a native app with the Dogwood icon

### iPhone/iPad
1. Open the URL in Safari
2. Tap the Share button (↑) → "Add to Home Screen"
3. It installs like a native app with the Dogwood icon

---

## Features
- Works offline after first load (service worker caches everything)
- Installs to home screen with custom icon
- Full-screen app experience (no browser chrome)
- Auto-updates when you deploy changes
- AI-powered measurement report parsing (requires internet)
- AI-powered insurance estimate parsing (requires internet)

---

## Custom Domain (Optional)
Both Vercel and Netlify let you connect a custom domain for free:
- e.g., `contracts.dogwoodgc.com`

## Notes
- The AI features (PDF parsing) require an internet connection and use the Anthropic API
- The app itself works offline once loaded
- Print/PDF generation uses the browser's built-in print function
