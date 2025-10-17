import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Use pdf2json - a simpler, Next.js-friendly alternative
    const PDFParser = (await import('pdf2json')).default;
    const pdfParser = new PDFParser();
    
    // Parse PDF
    const pdfData = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
      pdfParser.on('pdfParser_dataReady', pdfData => resolve(pdfData));
      pdfParser.parseBuffer(buffer);
    });

    // Extract text from all pages
    let fullText = '';
    pdfData.Pages.forEach(page => {
      page.Texts.forEach(text => {
        text.R.forEach(r => {
          try {
            fullText += decodeURIComponent(r.T) + ' ';
          } catch (e) {
            // If decoding fails, use the raw text
            fullText += r.T + ' ';
          }
        });
      });
    });

    // Clean up the text
    const content = fullText
      .replace(/\s+/g, ' ')  // Replace multiple spaces
      .replace(/\n+/g, '\n')  // Replace multiple newlines
      .trim();

    if (!content || content.length < 100) {
      return NextResponse.json({ 
        error: 'Could not extract text from PDF or PDF is empty' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      content,
      title: file.name.replace('.pdf', ''),
      wordCount: content.split(/\s+/).length,
      pageCount: pdfData.Pages.length
    });

  } catch (error) {
    console.error('Error extracting PDF:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to extract content from PDF' 
    }, { status: 500 });
  }
}
