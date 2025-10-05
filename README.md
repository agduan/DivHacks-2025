# Finosaur.ai: a financial time machine

A financial forecasting tool that uses three AI personalities to predict where your money habits will take you. Built with a retro gaming aesthetic.

## Overview

Enter your income, expenses, and debt to see two financial projections:
- Status quo: continuing current habits
- What-if scenarios: testing specific changes

The interface uses pixel-art dinosaurs that change based on your financial health, along with charts and AI advisor insights.

## AI Advisors

Three Gemini API instances, each with different prompting strategies:
- Casey the Calculator: conservative, data-focused predictions
- Sunny Saver: optimistic projections with growth emphasis
- Grump Gains: pessimistic outlook with blunt assessments

Each personality introduces itself on load, then provide analysis after you run a forecast.

## Features

- Timeline charts showing net worth projections over time
- Calendar and graph view options
- What-if scenario testing (adjust spending categories, add savings goals)
- Three AI perspectives on each forecast
- Real market data integration (S&P 500, NASDAQ)
- Capital One Nessie API integration for transaction data
- Guest mode (no account required)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Google Gemini API
- Capital One Nessie API
- Echo authentication

## Setup

Install dependencies:
```bash
npm install
```

Run locally:
```bash
npm run dev
```

Visit http://localhost:3000

### API Keys (Optional)

Create `.env.local`:
```
GEMINI_API_KEY=your_key
NESSIE_API_KEY=your_key
```

App works without these using mock data.

## Project Structure

```
app/
  api/              # API routes for AI, forecasting, auth
  page.tsx          # Main app
  globals.css       # Retro theme + animations

components/
  AIAgentComparison.tsx    # Three-agent cards with speech bubbles
  DinoSprite.tsx           # Animated pixel art sprites
  TimelineChart.tsx        # Financial projections graph
  FinancialInputForm.tsx   # Income/expense inputs
  ScenarioAdjuster.tsx     # What-if testing

utils/
  geminiPersonalities.ts   # AI personality configs
  financialCalculations.ts # Forecast algorithms
  nessieIntegration.ts     # Banking data handling
```

## Usage

1. Sign in or use guest mode
2. Input financial data or use demo
3. Add what-if scenarios (optional)
4. Click "Travel to Next Year" for 12-month forecast
5. View predictions from three AI advisors
6. Toggle between chart and calendar views

## Limitations

- Month-to-month projections only (not full portfolio modeling)
- AI predictions are for demonstration, not financial advice
- Nessie integration uses sandbox data
- Guest mode data not persisted

## About

Built for DivHacks 2025 at Columbia. 

The goal was to make financial planning more approachable by framing it as time travel with personality-driven AI advisors. The three-advisor setup shows that predictions depend on assumptions and risk tolerance, not absolute truth.

## Credits

- Dinosaur sprites: Arks (https://arks.itch.io/dino-characters) - CC BY 4.0
- Coin/gem sprites: La Red Games (https://laredgames.itch.io/gems-coins-free) - CC0