import { Resend } from 'resend';

export const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey || apiKey === 're_placeholder_key' || apiKey.startsWith('re_placeholder')) {
    console.log('\x1b[33m%s\x1b[0m', `=== [MOCK EMAIL SENT] ===`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (truncated): ${html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    console.log('\x1b[33m%s\x1b[0m', `=========================`);
    return { id: 'mock_email_id_success', mock: true };
  }

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: 'BeautyX Intimates <onboarding@resend.dev>',
      to,
      subject,
      html
    });
    if (response.error) {
      console.error('Resend API returned an error:', response.error);
      return { success: false, error: response.error };
    }
    return response;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    // Return gracefully instead of throwing to prevent crashing the caller process (e.g. registration, checkout)
    return { success: false, error: error.message };
  }
};
