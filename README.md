# finosaur.ai 🦕

A playful sci-fi web app that uses AI to show you what your financial future could look like based on your current spending habits — or how things might change if you adjust them.

## What It Does

Ever wonder where your money habits will take you? This app takes your income, expenses, and financial data, then creates two timelines:

1. **Status Quo**: What happens if you keep doing what you're doing
2. **What-If Scenarios**: What happens if you make changes (cut spending, save more, etc.)

You get visual comparisons with pixel-art avatars showing your current vs. future financial health, complete with charts and AI-powered insights.

## Features

- **Data Input**: Import mock transaction data from Capital One's Nessie API or enter your own numbers
- **AI Forecasting**: 3 different versions of Gemini predicts your financial future
- **Timeline Visualization**: Side-by-side charts comparing different financial paths
- **Avatar States**: Watch your financial avatar evolve from struggling → stable → thriving → wealthy
- **AI Comparison Panel**: See how different AI models predict your future and which one is most reliable (using Opik evaluation)
- **What-If Explorer**: Adjust spending in different categories and see instant results
- **Future-Ready**: Placeholders for Echo savings integration and premium features

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (custom sci-fi/retro theme)
- **Charts**: Recharts
- **API Integration**: Google Gemini API, Opik API for AI Evaluation, Capital One Nessie API (mock data included)
- **AI Evaluation**: Opik

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**: Navigate to `http://localhost:3000`

4. **(Optional) Enable Real AI Evaluation**:
   ```bash
   cp env.example .env.local
   ```
   Then add your API keys:
   - **Opik** (free): Get key at [comet.com/opik](https://www.comet.com/site/products/opik/)
   - **Google Gemini** (optional): For real predictions
   
   See [OPIK_INTEGRATION.md](./OPIK_INTEGRATION.md) for detailed setup guide

## Project Structure

```
├── app/
│   ├── api/              # API routes (forecast, nessie, ai-agents)
│   ├── globals.css       # Global styles + retro theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── Avatar.tsx              # Financial state avatar
│   ├── AIAgentComparison.tsx   # Multi-AI comparison
│   ├── FinancialInputForm.tsx  # Income/expense inputs
│   ├── IntegrationPlaceholders.tsx  # Echo widget
│   ├── ScenarioAdjuster.tsx    # What-if scenario builder
│   └── TimelineChart.tsx       # Financial timeline graph
├── types/
│   └── financial.ts      # TypeScript type definitions
└── utils/
    ├── financialCalculations.ts  # Core forecast logic
    └── mockData.ts               # Sample data & Nessie parser
```

## How It Works

1. **Input**: Enter your monthly income, expenses, savings, and debt (or use the mock data)
2. **Adjust**: Add "what-if" changes like reducing food spending by 20% or saving $50/month
3. **Travel**: Click "Travel to Next Year!" to see your financial future
4. **Compare**: View status quo vs. what-if timelines side by side
5. **Analyze**: Check AI agent predictions and Opik reliability scores

## Customization

- **Change AI logic**: Edit `app/api/ai-agents/route.ts`
- **Change theme colors**: Update `tailwind.config.ts`
- **Adjust calculation logic**: Modify `utils/financialCalculations.ts`
- **Add real APIs**: Replace mock data in API routes with actual calls

## Future Enhancements

  
- Echo monetization for premium features
- Multi-year forecasts (3, 5, 10 years out)
- Social sharing of anonymized financial journeys
- Gamification & achievement badges
- Export reports as PDF

## AI & Opik Integration

The app supports **real AI evaluation** with Opik:

- **Without API keys**: Uses mock predictions and evaluations (perfect for demos)
- **With Opik key**: Tracks predictions and provides real consistency/accuracy scores
- **With Gemini key**: Gets actual insights from Google Gemini

All integrations are optional and the app works great without them!

📖 **Full setup guide**: [OPIK_INTEGRATION.md](./OPIK_INTEGRATION.md)

## Notes

- This is a hackathon project built for learning and demonstration
- Core financial calculations are real and functional
- AI integrations can be mock (for demo) or real (with API keys)
- Opik integration is production-ready when you add your API key

Built for DivHacks 2025 🚀