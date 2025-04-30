import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    // Check if a file was uploaded
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Generate a unique file name or use the original file name
    const fileName = `articles/${Date.now()}_blob.txt`;  // You can customize this for your needs

    // Upload the file to Vercel Blob storage
    const { url } = await put(fileName, file, { access: 'public' });

    // Return the URL of the uploaded file
    return NextResponse.json({ url });

  } catch (error) {
    console.error('Error during file upload:', error);

    // Return an error response if something goes wrong
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

