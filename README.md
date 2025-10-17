# TLDRizer - Multi-AI Summarization Tool

AI-powered summarization app with support for ChatGPT, Claude, and Hugging Face.

## Features

✅ Summarize articles from URLs
✅ Extract and summarize PDFs
✅ Choose between 3 AI providers (Hugging Face/ChatGPT/Claude)
✅ Copy and download summaries

## Setup

### 1. Install AI SDK dependencies

```bash
npm install openai @anthropic-ai/sdk
```

### 2. Get API Keys

**Hugging Face (Free):**
- https://huggingface.co/settings/tokens
- Check "Make calls to Inference Providers" when creating token

**OpenAI (Paid ~$0.0001/summary):**
- https://platform.openai.com/api-keys

**Anthropic Claude (Paid ~$0.003/summary):**
- https://console.anthropic.com/

### 3. Add to `.env.local`

```env
HUGGINGFACE_API_KEY=hf_your_key
OPENAI_API_KEY=sk-your_key
ANTHROPIC_API_KEY=sk-ant-your_key
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

## Usage

1. Select AI model (Hugging Face/ChatGPT/Claude)
2. Paste URL or upload PDF
3. Get instant summary

PS.
I haven't tried the Claude and OpenAI models yet. Since I didn't have the funds to pay for them. I did try the Hugging Face model, and it worked. Would love to see if anyone can try the Claude and OpenAI models.

Built with Next.js 15 + React 19 + Tailwind CSS 4
