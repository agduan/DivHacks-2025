# Opik Integration Guide 🤖

This guide explains how to integrate Opik for real AI agent evaluation in your Financial Time Machine app.

## What is Opik?

Opik is an open-source LLM evaluation framework that helps you:
- Compare predictions from multiple AI models
- Track consistency and accuracy over time
- Identify which AI agents are most reliable
- Log and analyze prediction quality

## Setup Steps

### 1. Get API Keys

#### Opik (Free)
1. Visit [Comet Opik](https://www.comet.com/site/products/opik/)
2. Sign up for a free account
3. Navigate to Settings → API Keys
4. Copy your API key

#### AI Provider Keys (Optional - for real AI predictions)

**OpenAI (GPT-4)**
- Visit [OpenAI Platform](https://platform.openai.com/api-keys)
- Create an API key (starts with `sk-`)
- Note: Paid API, ~$0.03 per 1K tokens

**Anthropic (Claude)**
- Visit [Anthropic Console](https://console.anthropic.com/)
- Create an API key (starts with `sk-ant-`)
- Note: Paid API, similar pricing to OpenAI

**Google AI (Gemini)**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Generate API key
- Note: Has free tier!

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy from env.example
cp env.example .env.local
```

Add your keys:
```env
OPIK_API_KEY=your_actual_opik_key_here
OPENAI_API_KEY=sk-your_openai_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
GOOGLE_AI_API_KEY=your_google_key_here
```

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Restart
npm run dev
```

## How It Works

### Architecture

```
User Financial Data
    ↓
[GPT-4] [Claude] [Gemini] ← Parallel AI Analysis
    ↓         ↓        ↓
Financial Insights Generated
    ↓
Opik Evaluation Engine
    ↓
Consistency | Accuracy | Reliability Scores
    ↓
Display Best Prediction
```

### What Gets Evaluated

1. **Consistency**: How stable are predictions across similar inputs?
   - Measures variance in month-to-month growth rates
   - Higher score = more predictable behavior

2. **Accuracy**: How close to ground truth? (if available)
   - Compares predictions to actual outcomes or baseline
   - Used to detect over-optimistic or overly conservative models

3. **Reliability**: Overall trustworthiness
   - Average of consistency + accuracy
   - Highlights the most dependable AI agent

### Opik Features in Your App

✅ **Real-time Evaluation**: Every prediction is scored automatically

✅ **Longitudinal Tracking**: Predictions are logged over time to identify trends

✅ **Agent Comparison**: Side-by-side scores for GPT-4, Claude, and Gemini

✅ **Confidence Calibration**: Detects overconfident or underconfident predictions

✅ **Notes & Insights**: Human-readable explanations of scores

## Testing Without API Keys

The app **still works** without API keys! It will:
- Use mock AI predictions (with slight variations)
- Generate mock Opik scores
- Display "Mock evaluation" in the notes

This is perfect for:
- Development and testing
- Hackathon demos
- Showing the UI/UX without API costs

## Cost Considerations

**Free Tier Options:**
- Opik: ✅ Free
- Google Gemini: ✅ Free tier available
- OpenAI GPT-4: ❌ Paid (~$0.03/1K tokens)
- Anthropic Claude: ❌ Paid (~$0.015/1K tokens)

**For Hackathons:**
- Use Google Gemini only (free tier)
- Or stick with mock data and explain the architecture

**Typical Request:**
- Input: ~300 tokens (financial data + prompt)
- Output: ~100 tokens (insights + reasoning)
- Cost per request: ~$0.01 with GPT-4
- 100 predictions = ~$1

## Viewing Opik Dashboard

Once you have predictions running:

1. Go to [Comet Opik Dashboard](https://www.comet.com/site/products/opik/)
2. Login to your account
3. Navigate to Projects → "financial-time-machine"
4. View:
   - Trace logs for each prediction
   - Score trends over time
   - Agent performance comparisons
   - Input/output examples

## Advanced: Custom Evaluation Metrics

You can add custom metrics in `utils/opikEvaluation.ts`:

```typescript
// Example: Add "financial_prudence" metric
const prudenceScore = evaluatePrudence(agent.predictions);
await trace.log({
  scores: {
    consistency,
    accuracy,
    reliability,
    financial_prudence: prudenceScore, // Custom metric
  },
});
```

## Troubleshooting

**"Opik not configured" warning**
- Check that `OPIK_API_KEY` is in `.env.local`
- Restart dev server after adding keys

**AI predictions timing out**
- AI APIs can be slow (2-5 seconds per agent)
- Consider caching results
- Add loading states in UI

**JSON parsing errors**
- AI models sometimes return non-JSON text
- The code has try-catch to fallback to mock data
- Check console logs for actual AI responses

**"Module not found: opik"**
- Run `npm install` to ensure all packages are installed
- Check that opik is in package.json dependencies

## Next Steps

1. **Get Opik key** (free) and test basic logging
2. **Add one AI provider** (suggest Google Gemini for free tier)
3. **Run predictions** and check Opik dashboard
4. **Add more providers** as budget allows
5. **Analyze results** to see which AI is most reliable

## Support

- Opik Docs: https://www.comet.com/docs/opik/
- Opik GitHub: https://github.com/comet-ml/opik
- OpenAI Docs: https://platform.openai.com/docs
- Anthropic Docs: https://docs.anthropic.com
- Google AI Docs: https://ai.google.dev/

---

**Ready to go!** 🚀 Your app is now set up for real AI evaluation with Opik!
