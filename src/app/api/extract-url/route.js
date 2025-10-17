import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, iframe, .ad, .advertisement').remove();

    // Try to extract article content using common selectors
    let content = '';
    
    // Try article tag first
    if ($('article').length > 0) {
      content = $('article').text();
    }
    // Try main tag
    else if ($('main').length > 0) {
      content = $('main').text();
    }
    // Try common content classes
    else if ($('.post-content, .article-content, .entry-content, .content').length > 0) {
      content = $('.post-content, .article-content, .entry-content, .content').first().text();
    }
    // Fallback to body
    else {
      content = $('body').text();
    }

    // Clean up the text
    content = content
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n+/g, '\n')  // Replace multiple newlines with single newline
      .trim();

    // Extract title
    const title = $('title').text() || $('h1').first().text() || 'Untitled';

    if (!content || content.length < 100) {
      return NextResponse.json({ 
        error: 'Could not extract meaningful content from URL' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      content,
      title: title.trim(),
      wordCount: content.split(/\s+/).length
    });

  } catch (error) {
    console.error('Error extracting URL:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to extract content from URL' 
    }, { status: 500 });
  }
}
