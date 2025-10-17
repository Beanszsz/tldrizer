# TLDRizer Implementation Guide

## Quick Setup

Run this command to set up everything:

```bash
complete-setup.bat
```

This will create all directories and move files to the correct locations.

## File Structure Created

```
src/
├── app/
│   ├── api/
│   │   ├── extract-url/
│   │   │   └── route.js          # Extracts text from URLs using cheerio
│   │   ├── extract-pdf/
│   │   │   └── route.js          # Extracts text from PDFs using pdf-parse
│   │   └── summarize/
│   │       └── route.js          # Summarizes text using Hugging Face
│   ├── page.js                    # Main UI page
│   └── layout.js                  # (existing)
└── components/
    ├── FileUpload.jsx             # PDF upload with drag-and-drop
    ├── UrlInput.jsx               # URL input field
    └── SummaryDisplay.jsx         # Shows summary results
```

## How Each Dependency Works

### 1. **@huggingface/inference** - AI Summarization

Located in: `src/app/api/summarize/route.js`

```javascript
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const result = await hf.summarization({
  model: "facebook/bart-large-cnn",
  inputs: content,
  parameters: { max_length: 150, min_length: 30 },
});
```

**What it does:**

- Calls Hugging Face API to summarize text
- Chunks large texts automatically
- Combines multiple summaries for long articles
- Uses `facebook/bart-large-cnn` model (you can change this)

### 2. **pdf-parse** - PDF Text Extraction

Located in: `src/app/api/extract-pdf/route.js`

```javascript
const data = await pdf(buffer);
const content = data.text; // Extracted text
const pageCount = data.numpages; // Number of pages
```

**What it does:**

- Converts PDF files to plain text
- Works with text-based PDFs
- Returns page count and metadata

### 3. **cheerio** - Web Scraping

Located in: `src/app/api/extract-url/route.js`

```javascript
const $ = cheerio.load(html);
$("script, style, nav").remove(); // Clean unwanted elements
const content = $("article").text(); // Extract main content
```

**What it does:**

- Parses HTML from URLs
- Removes scripts, ads, navigation
- Finds article content using smart selectors
- Cleans and formats text

### 4. **axios** - HTTP Requests

Located in: `src/app/api/extract-url/route.js`

```javascript
const response = await axios.get(url, {
  headers: { "User-Agent": "Mozilla/5.0..." },
  timeout: 10000,
});
```

**What it does:**

- Fetches webpage content
- Sets proper headers to avoid blocking
- Handles timeouts

### 5. **react-dropzone** - File Upload UI

Located in: `src/components/FileUpload.jsx`

```javascript
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: { "application/pdf": [".pdf"] },
  maxFiles: 1,
});
```

**What it does:**

- Provides drag-and-drop file upload
- Validates file types (PDF only)
- Beautiful UI feedback

### 6. **lucide-react** - Icons

Located in: All components

```javascript
import { Upload, FileText, Loader2, Copy } from "lucide-react";
```

**What it does:**

- Provides clean, modern icons
- Tree-shakeable (only imports what you use)

## Workflow Explained

### URL Summarization Flow:

1. User enters URL in `UrlInput` component
2. Frontend calls `/api/extract-url`
3. **axios** fetches the webpage
4. **cheerio** extracts article text
5. Frontend calls `/api/summarize` with extracted text
6. **@huggingface/inference** generates summary
7. `SummaryDisplay` shows result

### PDF Summarization Flow:

1. User drops PDF in `FileUpload` component
2. **react-dropzone** handles file
3. Frontend calls `/api/extract-pdf`
4. **pdf-parse** extracts text from PDF
5. Frontend calls `/api/summarize` with extracted text
6. **@huggingface/inference** generates summary
7. `SummaryDisplay` shows result

## Configuration

### Environment Variables (.env.local)

```env
HUGGINGFACE_API_KEY=hf_your_key_here
```

Get your free API key from: https://huggingface.co/settings/tokens

### Hugging Face Models You Can Use

Change the model in `src/app/api/summarize/route.js`:

```javascript
// Fast and good for news
model: "facebook/bart-large-cnn";

// Best for extractive summaries
model: "google/pegasus-xsum";

// Best quality (slower)
model: "mistralai/Mistral-7B-Instruct-v0.2";

// Lightweight option
model: "Falconsai/text_summarization";
```

## Testing It Out

1. **Run the app:**

   ```bash
   npm run dev
   ```

2. **Test with a URL:**

   - Try: https://en.wikipedia.org/wiki/Artificial_intelligence
   - Or any blog/article URL

3. **Test with a PDF:**
   - Upload any text-based PDF file
   - Drag and drop works!

## Troubleshooting

### "HUGGINGFACE_API_KEY not configured"

- Create `.env.local` in root directory
- Add: `HUGGINGFACE_API_KEY=hf_xxxxx`
- Restart dev server

### "Could not extract content from URL"

- Some sites block scraping
- Try different URLs
- Check if site requires JavaScript (cheerio can't handle that)

### "Failed to extract text from PDF"

- PDF might be scanned images (needs OCR)
- Try a different PDF
- Check PDF isn't password protected

### Slow summarization

- Free tier has rate limits
- Try a different model
- Content might be very long (chunking takes time)

## Customization Ideas

1. **Add more file types:** Modify `FileUpload.jsx` to accept .docx, .txt
2. **Support multiple languages:** Some HF models support multilingual
3. **Adjust summary length:** Change `max_length` parameter
4. **Add history:** Store summaries in localStorage
5. **Streaming responses:** Use Hugging Face streaming for real-time output

## Cost Breakdown

- All npm packages: **FREE**
- Hugging Face API free tier: **~30k chars/month FREE**
- Local hosting: **FREE** (runs on your machine)

Total cost: **$0**

For unlimited usage, consider `@xenova/transformers` to run models locally.
