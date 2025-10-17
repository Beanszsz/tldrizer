# Quick Start Guide

## Installation

```bash
npm install openai @anthropic-ai/sdk
```

## Environment Setup (.env.local)

```env
# Add at least one API key (or all three)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

## Get API Keys

### Hugging Face (FREE)
1. https://huggingface.co/settings/tokens
2. Click "New token"
3. **IMPORTANT:** Check "Make calls to Inference Providers"
4. Copy token

### OpenAI (Paid)
1. https://platform.openai.com/api-keys
2. Create API key
3. Copy token

### Anthropic (Paid)
1. https://console.anthropic.com/
2. Create API key
3. Copy token

## Run

```bash
npm run dev
```

## Features Implemented

✅ URL extraction with `cheerio` + `axios`
✅ PDF extraction with `pdf2json`
✅ 3 AI providers: Hugging Face / ChatGPT / Claude
✅ Model selector UI
✅ Copy to clipboard
✅ Download as text file
✅ Beautiful Tailwind UI
✅ Error handling & loading states

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── extract-url/route.js     # Web scraping
│   │   ├── extract-pdf/route.js     # PDF parsing  
│   │   └── summarize/route.js       # Multi-AI summarization
│   └── page.js                       # Main UI
└── components/
    ├── FileUpload.jsx                # PDF drag-drop
    ├── UrlInput.jsx                  # URL input
    ├── ModelSelector.jsx             # AI provider picker
    └── SummaryDisplay.jsx            # Results
```

## Speed & Cost Comparison

| Provider      | Speed    | Quality   | Cost/Summary |
|---------------|----------|-----------|--------------|
| Hugging Face  | 20-60s   | Good      | FREE         |
| ChatGPT       | 2-5s     | Great     | $0.0001      |
| Claude Sonnet | 3-6s     | Excellent | $0.003       |

## Common Issues

**"Insufficient permissions" (HuggingFace)**
→ Recreate token with "Make calls to Inference Providers" checked

**"Model is loading" (HuggingFace)**  
→ Wait 30-60 seconds, first request loads model

**"Failed to extract content"**
→ Some sites block scraping, try different URL

**"API key not configured"**
→ Check .env.local exists and restart dev server
