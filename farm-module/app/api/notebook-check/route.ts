import { NextRequest, NextResponse } from 'next/server';

export interface NotebookCheckBody {
  objects_detected: boolean;
  correct_count: boolean;
  c_words_present: boolean;
  feedback?: string;
}

/**
 * Accepts multipart form with 'file' (image).
 * In production, send to Vision AI with prompt:
 * "Analyze this notebook page. Check: 1) Are three objects drawn?
 * 2) Is the number 3 written? 3) Are there words starting with C?
 * Return JSON: { objects_detected, correct_count, c_words_present }"
 * For now returns mock positive response.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !file.size) {
      return NextResponse.json(
        { objects_detected: false, correct_count: false, c_words_present: false, feedback: 'No image uploaded.' },
        { status: 400 }
      );
    }
    // Optional: validate type
    const type = file.type.toLowerCase();
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(type)) {
      return NextResponse.json(
        { objects_detected: false, correct_count: false, c_words_present: false, feedback: 'Please upload a JPG or PNG image.' },
        { status: 400 }
      );
    }

    // TODO: Send to Vision AI (e.g. OpenAI Vision, Google Vision) with prompt:
    // "Analyze this notebook page created by a child. Check: 1) Are three objects drawn?
    // 2) Is the number 3 written? 3) Are there words starting with letter C?
    // Return JSON format: { objects_detected: true/false, correct_count: true/false, c_words_present: true/false }"
    // For now return mock success to allow flow testing.
    const mockResult: NotebookCheckBody = {
      objects_detected: true,
      correct_count: true,
      c_words_present: true,
      feedback: 'Great drawing!',
    };

    return NextResponse.json(mockResult);
  } catch (err) {
    console.error('notebook-check error:', err);
    return NextResponse.json(
      { objects_detected: false, correct_count: false, c_words_present: false, feedback: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
