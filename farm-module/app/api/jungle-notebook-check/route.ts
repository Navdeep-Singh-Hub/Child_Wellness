import { NextRequest, NextResponse } from 'next/server';

export interface JungleNotebookCheckBody {
  rhymes_present: boolean;
  syllables_marked: boolean;
  drawing_present: boolean;
  feedback?: string;
}

/**
 * Accepts multipart form with 'file' (image).
 * Vision AI prompt (for integration):
 * "Analyze this notebook page created by a child. Check: 1) Are two rhyming words written?
 * 2) Is a jungle word written and syllables marked? 3) Are drawings present?
 * Return JSON: { rhymes_present, syllables_marked, drawing_present }"
 * Currently returns mock success.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !file.size) {
      return NextResponse.json(
        {
          rhymes_present: false,
          syllables_marked: false,
          drawing_present: false,
          feedback: 'No image uploaded.',
        },
        { status: 400 }
      );
    }
    const type = file.type.toLowerCase();
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(type)) {
      return NextResponse.json(
        {
          rhymes_present: false,
          syllables_marked: false,
          drawing_present: false,
          feedback: 'Please upload a JPG or PNG image.',
        },
        { status: 400 }
      );
    }

    const mockResult: JungleNotebookCheckBody = {
      rhymes_present: true,
      syllables_marked: true,
      drawing_present: true,
      feedback: 'Great job exploring the jungle!',
    };

    return NextResponse.json(mockResult);
  } catch (err) {
    console.error('jungle-notebook-check error:', err);
    return NextResponse.json(
      {
        rhymes_present: false,
        syllables_marked: false,
        drawing_present: false,
        feedback: 'Something went wrong.',
      },
      { status: 500 }
    );
  }
}
