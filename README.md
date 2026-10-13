# AI Fashion Stylist

A React + TypeScript app that lets users upload a portrait and receive personalized fashion recommendations powered by Google Gemini.

The app analyzes the uploaded face, identifies face shape and gender, suggests flattering hairstyle options, and generates color palettes with virtual outfit try-on previews.

## Features

- Upload a portrait image
- Detect face shape and gender
- Recommend complementary hairstyle concepts
- Generate fashion color palettes based on skin tones and appearance
- Render outfit suggestions using AI-generated visual try-ons
- Modern dark UI with responsive layout

## Tech Stack

- React 19
- TypeScript
- Vite
- Google Gemini AI

## Project Structure

```text
.
├── App.tsx
├── components/
│   ├── ColorPalettes.tsx
│   ├── HairstyleSuggestions.tsx
│   ├── ImageUploader.tsx
│   ├── LoadingSpinner.tsx
│   └── icons/
├── services/
│   └── geminiService.ts
├── index.html
├── index.tsx
├── metadata.json
├── package.json
├── tsconfig.json
├── types.ts
├── vite.config.ts
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- A Google Gemini API key

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root and add your Gemini API key:

```env
API_KEY=your_gemini_api_key_here
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in your browser at:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev     # start the local Vite dev server
npm run build   # build the production bundle
npm run preview # preview the production build locally
```

## Notes

This project relies on Gemini for image analysis and image generation. Make sure your API key has access to the required models used in `services/geminiService.ts`.

## License

This project is currently unlicensed.
