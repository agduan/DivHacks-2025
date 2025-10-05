# finosaur.ai 🦕

A retro-styled web app that uses AI to predict your financial future. Built with three distinct AI personalities that each offer different perspectives on where your money habits will take you.

## What It Does

Financial Time Machine takes your income, expenses, and spending habits, then shows you two possible futures:

**Status Quo**: Where you'll end up if you keep your current habits

**What-If Scenarios**: Where you could go if you make specific changes

The app visualizes these paths with pixel-art dinosaurs that evolve based on your financial health, alongside detailed charts and insights from three AI financial advisors.

## The AI Advisors

Three variations of Google's Gemini model act as your financial coaches, each with their own personality:

- **Casey the Calculator**: A pragmatic analyst who sticks to data-driven predictions
- **Sunny Saver**: An optimistic wealth coach focused on motivation and growth potential
- **Grump Gains**: A blunt, sarcastic advisor who doesn't sugarcoat the hard truths

Before you run any analysis, they introduce themselves. After you click "Travel to Next Year," they provide detailed predictions and insights based on your financial data.

## Key Features

**Timeline Visualization**: View your financial trajectory over months or years with interactive charts and calendar views

**What-If Explorer**: Test different spending scenarios (cut food spending by 20%, add $100 monthly savings, etc.) and see immediate impacts

**Dynamic Avatars**: Watch your financial dinosaur change from struggling to thriving as your net worth improves

**Multi-Agent AI Analysis**: Compare predictions from three different AI perspectives, complete with confidence scores

**Progress Tracking**: Enhanced time travel button shows how far you've explored into your financial future

**Nessie Integration**: Import transaction data from Capital One's developer API or use demo data

**Guest Mode**: Try the app without creating an account

## Tech Stack

**Framework**: Next.js 14 with App Router

**Language**: TypeScript

**Styling**: Tailwind CSS with custom retro/cyberpunk theme and pixel art assets

**Charts**: Recharts for data visualization

**AI**: Google Gemini API with custom personality prompts

**APIs**: Capital One Nessie (banking data), Echo (authentication)

**Fonts**: VCR OSD Mono for that authentic retro terminal look

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Optional: Add Real API Keys

Create a `.env.local` file with:

```
GEMINI_API_KEY=your_gemini_key_here
NESSIE_API_KEY=your_nessie_key_here
```

The app works fine without these (it uses mock data and fallback predictions), but real API keys enable live AI analysis.

## Project Structure

```
app/
  api/
    ai-agents/        # Handles AI personality analysis
    forecast/         # Financial calculations endpoint
    nessie/          # Banking data integration
    auth/            # Sign in/sign up routes
  globals.css        # Retro theme styles + dino animations
  page.tsx           # Main application page

components/
  AIAgentComparison.tsx   # Three-agent comparison cards with speech bubbles
  Avatar.tsx              # Pixel art financial state indicators
  DinoSprite.tsx          # Animated dinosaur sprites
  FinancialInputForm.tsx  # Income/expense input
  ScenarioAdjuster.tsx    # What-if scenario builder
  TimelineChart.tsx       # Graph visualization
  CalendarTimeline.tsx    # Calendar view of predictions

utils/
  financialCalculations.ts  # Core forecasting logic
  geminiPersonalities.ts    # AI personality definitions and API calls
  nessieIntegration.ts      # Banking API integration
  mockData.ts              # Demo data

types/
  financial.ts      # TypeScript definitions
```

## How to Use It

1. Sign in or continue as guest
2. Enter your monthly income, expenses, current savings, and debt (or use the demo data)
3. Optionally add what-if scenarios (reduce dining out, increase savings, etc.)
4. Click "Travel to Next Year" to see your 12-month forecast
5. Watch the timeline progress bar grow as you explore further into the future
6. Review predictions from all three AI advisors and compare their insights
7. Adjust the timeline view between chart and calendar modes

## Customization

**Change AI personalities**: Edit `utils/geminiPersonalities.ts` to modify prompts and behavior

**Adjust theme colors**: Update color definitions in `tailwind.config.ts`

**Modify calculations**: Change forecast logic in `utils/financialCalculations.ts`

**Add new dinosaur animations**: Update sprite sheets in `public/dinos/` and CSS in `globals.css`

## Known Limitations

This is a hackathon project, so some features are simplified:

- Financial calculations are month-to-month projections, not sophisticated portfolio modeling
- AI predictions are based on patterns, not real financial advice
- Nessie API integration uses mock data (Capital One's sandbox)
- Guest mode data isn't persisted
- Timeline is currently limited to viewing future months, not years

## About This Project

Built for DivHacks 2025. The goal was to make financial planning less intimidating by adding personality, humor, and retro gaming aesthetics to what's usually a pretty dry topic.

The three AI advisor concept came from wanting to show that financial predictions aren't absolute truth - they're perspectives shaped by different assumptions and attitudes toward risk and growth.

## Credits

- Dinosaur pixel art sprites by Arks: https://arks.itch.io/dino-characters (Creative Commons Attribution v4.0)