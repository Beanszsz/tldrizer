import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Initialize OpenAI and Anthropic clients
let openai, anthropic;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Function to chunk text into smaller pieces
function chunkText(text, maxLength = 1024) {
  const words = text.split(" ");
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (const word of words) {
    if (currentLength + word.length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [word];
      currentLength = word.length;
    } else {
      currentChunk.push(word);
      currentLength += word.length + 1;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

// Summarize with OpenAI (ChatGPT)
async function summarizeWithOpenAI(content, model = "gpt-4o-mini") {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  console.log("Using OpenAI model:", model);

  const completion = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that creates concise, accurate summaries of articles, blogs, and documents. Format your summary with clear paragraphs separated by double line breaks for better readability. Focus on the main points and key takeaways.",
      },
      {
        role: "user",
        content: `Please provide a well-formatted, comprehensive summary of the following text. Use paragraphs with line breaks between main points for better readability:\n\n${content}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  return completion.choices[0].message.content;
}

// Summarize with Anthropic (Claude)
async function summarizeWithClaude(
  content,
  model = "claude-3-5-sonnet-20241022",
) {
  if (!anthropic) {
    throw new Error("Anthropic API key not configured");
  }

  console.log("Using Claude model:", model);

  const message = await anthropic.messages.create({
    model: model,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Please provide a well-formatted, comprehensive summary of the following text. Use clear paragraphs with line breaks between main points for better readability. Focus on the main points and key takeaways:\n\n${content}`,
      },
    ],
  });

  return message.content[0].text;
}

// Summarize with Hugging Face
async function summarizeWithHuggingFace(
  content,
  model = "facebook/bart-large-cnn",
) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error("Hugging Face API key not configured");
  }

  console.log("Using Hugging Face model:", model);

  // Clean and validate content
  const cleanedContent = content.trim();

  if (cleanedContent.length < 50) {
    throw new Error("Content too short to summarize (minimum 50 characters)");
  }

  // If content is too long, chunk it
  const chunks = chunkText(cleanedContent, 1000);
  console.log("Number of chunks:", chunks.length);

  let summaries = [];

  // Summarize each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Skip chunks that are too short
    if (chunk.trim().length < 50) {
      console.log(`Skipping chunk ${i + 1} (too short)`);
      continue;
    }

    console.log(
      `Processing chunk ${i + 1}/${chunks.length}, length: ${chunk.length}`,
    );

    const result = await hf.summarization({
      model: model,
      inputs: chunk,
      parameters: {
        max_length: 130,
        min_length: 30,
        do_sample: false,
      },
    });

    summaries.push(result.summary_text);
  }

  if (summaries.length === 0) {
    throw new Error("All chunks were too short to summarize");
  }

  // Combine summaries with line breaks
  let finalSummary = summaries.join("\n\n");

  // If combined summaries are still too long, summarize again
  if (summaries.length > 1 && finalSummary.split(" ").length > 200) {
    try {
      const result = await hf.summarization({
        model: model,
        inputs: finalSummary,
        parameters: {
          max_length: 200,
          min_length: 50,
          do_sample: false,
        },
      });
      finalSummary = result.summary_text;
    } catch (error) {
      console.log("Final summarization failed, using combined summaries");
    }
  }

  return finalSummary;
}

export async function POST(request) {
  try {
    const { content, provider = "huggingface", model } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    console.log("Starting summarization with provider:", provider);
    console.log("Content length:", content.length);

    let summary;
    let usedModel;

    // Route to appropriate AI provider
    try {
      switch (provider.toLowerCase()) {
        case "openai":
        case "chatgpt":
          usedModel = model || "gpt-4o-mini";
          summary = await summarizeWithOpenAI(content, usedModel);
          break;

        case "anthropic":
        case "claude":
          usedModel = model || "claude-3-5-sonnet-20241022";
          summary = await summarizeWithClaude(content, usedModel);
          break;

        case "huggingface":
        case "hf":
          usedModel = model || "facebook/bart-large-cnn";
          summary = await summarizeWithHuggingFace(content, usedModel);
          break;

        default:
          return NextResponse.json(
            {
              error: `Unknown provider: ${provider}. Use 'openai', 'claude', or 'huggingface'`,
            },
            { status: 400 },
          );
      }
    } catch (providerError) {
      console.error(`Error with ${provider}:`, providerError);

      // Provider-specific error messages
      if (provider === "openai" || provider === "chatgpt") {
        if (providerError.message.includes("API key")) {
          return NextResponse.json(
            {
              error:
                "❌ OpenAI API key not configured. Add OPENAI_API_KEY to .env.local or switch to Hugging Face (free).",
            },
            { status: 500 },
          );
        }
        if (providerError.code === "insufficient_quota") {
          return NextResponse.json(
            {
              error:
                "💳 OpenAI API quota exceeded. Add credits at https://platform.openai.com/account/billing or use Hugging Face (free).",
            },
            { status: 429 },
          );
        }
        if (providerError.status === 401) {
          return NextResponse.json(
            {
              error:
                "🔑 Invalid OpenAI API key. Check your key at https://platform.openai.com/api-keys or use Hugging Face (free).",
            },
            { status: 401 },
          );
        }
        return NextResponse.json(
          {
            error: `ChatGPT Error: ${providerError.message}. Try Hugging Face (free) instead.`,
          },
          { status: 500 },
        );
      }

      if (provider === "anthropic" || provider === "claude") {
        if (providerError.message.includes("API key")) {
          return NextResponse.json(
            {
              error:
                "❌ Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env.local or switch to Hugging Face.",
            },
            { status: 500 },
          );
        }
        if (providerError.status === 401) {
          return NextResponse.json(
            {
              error:
                "🔑 Invalid Anthropic API key. Check your key or use Hugging Face.",
            },
            { status: 401 },
          );
        }
        if (providerError.status === 429) {
          return NextResponse.json(
            {
              error:
                "💳 Claude API rate limit exceeded. Wait a moment or use Hugging Face.",
            },
            { status: 429 },
          );
        }
        return NextResponse.json(
          {
            error: `Claude Error: ${providerError.message}. Try Hugging Face instead.`,
          },
          { status: 500 },
        );
      }

      if (provider === "huggingface" || provider === "hf") {
        if (providerError.message.includes("permissions")) {
          return NextResponse.json(
            {
              error:
                '🔒 Hugging Face token needs "Inference Providers" permission. Recreate token at https://huggingface.co/settings/tokens',
            },
            { status: 403 },
          );
        }
        if (providerError.message.includes("loading")) {
          return NextResponse.json(
            {
              error:
                "⏳ Model is loading (first time takes 30-60s). Please wait and try again.",
            },
            { status: 503 },
          );
        }
        if (providerError.message.includes("too short")) {
          return NextResponse.json(
            {
              error:
                "📄 Content is too short to summarize. Need at least 50 characters of text.",
            },
            { status: 400 },
          );
        }
        if (providerError.message.includes("index out of range")) {
          return NextResponse.json(
            {
              error:
                "⚠️ PDF content format issue. Try a different PDF or use a URL instead.",
            },
            { status: 400 },
          );
        }
        if (providerError.message.includes("API key")) {
          return NextResponse.json(
            {
              error:
                "❌ Hugging Face API key not configured. Add HUGGINGFACE_API_KEY to .env.local",
            },
            { status: 500 },
          );
        }
        return NextResponse.json(
          {
            error: `Hugging Face Error: ${providerError.message}`,
          },
          { status: 500 },
        );
      }

      throw providerError;
    }

    console.log("Summary generated successfully");
    return NextResponse.json({
      summary,
      provider,
      model: usedModel,
    });
  } catch (error) {
    console.error("Error in summarization:", error);

    return NextResponse.json(
      {
        error: `❌ Unexpected error: ${error.message}. Please try again or contact support.`,
      },
      { status: 500 },
    );
  }
}
