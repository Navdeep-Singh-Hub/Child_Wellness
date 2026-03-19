import { NextRequest, NextResponse } from 'next/server';

export interface OceanNotebookCheckBody {
  objects_detected: boolean;
  correct_count: boolean;
  rhyming_words: boolean;
  feedback?: string;
}

/**
 * Accepts multipart form with 'file' (image).
 * Vision AI prompt (for integration):
 * "Analyze this notebook page made by a child. Check: 1) Are 5 fish or similar objects drawn?
 * 2) Is the number 5 written? 3) Are rhyming words present?
 * Return JSON: { objects_detected, correct_count, rhyming_words }"
 * Currently returns mock success.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !file.size) {
      return NextResponse.json(
        {
          objects_detected: false,
          correct_count: false,
          rhyming_words: false,
          feedback: 'No image uploaded.',
        },
        { status: 400 }
      );
    }
    const type = file.type.toLowerCase();
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(type)) {
      return NextResponse.json(
        {
          objects_detected: false,
          correct_count: false,
          rhyming_words: false,
          feedback: 'Please upload a JPG or PNG image.',
        },
        { status: 400 }
      );
    }

    const mockResult: OceanNotebookCheckBody = {
      objects_detected: true,
      correct_count: true,
      rhyming_words: true,
      feedback: 'Great job exploring the ocean!',
    };

    return NextResponse.json(mockResult);
  } catch (err) {
    console.error('ocean-notebook-check error:', err);
    return NextResponse.json(
      {
        objects_detected: false,
        correct_count: false,
        rhyming_words: false,
        feedback: 'Something went wrong.',
      },
      { status: 500 }
    );
  }
}
