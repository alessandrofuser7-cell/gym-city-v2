import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'gymcityasd@gmail.com';
const FROM_NAME = 'A.S.D. Gym City Pescara';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, email not sent');
    return false;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    });
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendSubscriptionExpiryReminder(
  userEmail: string,
  userName: string,
  expiryDate: Date,
  daysLeft: number
): Promise<boolean> {
  const formattedDate = expiryDate.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = daysLeft <= 0 
    ? '⚠️ Il tuo abbonamento Gym City è scaduto'
    : `⏰ Il tuo abbonamento Gym City scade tra ${daysLeft} giorni`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px;">
        <h1 style="color: #ccff00; margin: 0 0 20px 0; font-size: 24px;">
          A.S.D. Gym City Pescara
        </h1>
        
        <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">
          Ciao <strong>${userName}</strong>,
        </p>
        
        ${daysLeft <= 0 ? `
          <div style="background: #ff4444; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong>⚠️ Il tuo abbonamento è scaduto il ${formattedDate}</strong>
          </div>
          <p style="color: #cccccc; font-size: 14px;">
            Per continuare ad allenarti con noi, passa in reception per rinnovare il tuo abbonamento.
          </p>
        ` : `
          <div style="background: #ff9800; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong>⏰ Il tuo abbonamento scade il ${formattedDate}</strong>
            <br><span style="font-size: 14px;">Mancano solo ${daysLeft} giorni!</span>
          </div>
          <p style="color: #cccccc; font-size: 14px;">
            Ricordati di rinnovare il tuo abbonamento per continuare ad accedere ai nostri corsi.
          </p>
        `}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #888888; font-size: 12px; margin: 0;">
            📍 Strada della Bonifica, 126 - 65129 Pescara<br>
            📞 085.693819<br>
            📧 gymcityasd@gmail.com
          </p>
        </div>
      </div>
    </div>
  `;

  const text = daysLeft <= 0
    ? `Ciao ${userName}, il tuo abbonamento Gym City è scaduto il ${formattedDate}. Passa in reception per rinnovarlo.`
    : `Ciao ${userName}, il tuo abbonamento Gym City scade il ${formattedDate}. Mancano solo ${daysLeft} giorni! Ricordati di rinnovare.`;

  return sendEmail({
    to: userEmail,
    subject,
    text,
    html
  });
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  tempPassword: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px;">
        <h1 style="color: #ccff00; margin: 0 0 20px 0; font-size: 24px;">
          Benvenuto in Gym City! 💪
        </h1>
        
        <p style="color: #ffffff; font-size: 16px; margin-bottom: 20px;">
          Ciao <strong>${userName}</strong>,
        </p>
        
        <p style="color: #cccccc; font-size: 14px; margin-bottom: 20px;">
          Il tuo account per prenotare i corsi è stato creato con successo!
        </p>
        
        <div style="background: #ccff00; color: #1a1a2e; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0;"><strong>Le tue credenziali:</strong></p>
          <p style="margin: 0;">Email: <strong>${userEmail}</strong></p>
          <p style="margin: 0;">Password: <strong>${tempPassword}</strong></p>
        </div>
        
        <p style="color: #ff9800; font-size: 14px; margin-bottom: 20px;">
          ⚠️ Al primo accesso ti verrà chiesto di cambiare la password.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #888888; font-size: 12px; margin: 0;">
            📍 Strada della Bonifica, 126 - 65129 Pescara<br>
            📞 085.693819<br>
            📧 gymcityasd@gmail.com
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: '🎉 Benvenuto in Gym City Pescara!',
    text: `Ciao ${userName}, benvenuto in Gym City! Le tue credenziali: Email: ${userEmail}, Password: ${tempPassword}. Al primo accesso dovrai cambiare la password.`,
    html
  });
}
