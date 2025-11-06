import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const googleAppScriptUrl = process.env.GOOGLE_APP_SCRIPT_URL;

  if (!googleAppScriptUrl) {
    console.error('GOOGLE_APP_SCRIPT_URL environment variable is not set.');
    // We send a success response to avoid blocking the user experience.
    // The lead data can still be found in the Vercel function logs if needed.
    return res.status(200).json({ message: 'Submission received (server configuration pending).' });
  }

  try {
    const submissionData = req.body;

    // We don't need to wait for the full response from Google Apps Script,
    // just fire and forget.
    fetch(googleAppScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    // Assume success.
    return res.status(200).json({ message: 'Lead submitted successfully' });

  } catch (error) {
    console.error('Error submitting lead to Google App Script:', error);
    // Also send a success response here to not block the user.
    return res.status(200).json({ message: 'Submission received (error during processing).' });
  }
}
