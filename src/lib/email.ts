import { Resend } from 'resend'
import { db } from './db'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvitationEmail(
  email: string,
  nickname: string,
  invitationUrl: string
) {
  try {
    const result = await resend.emails.send({
      from: 'Quini Ranking <invitaciones@resend.dev>',
      to: email,
      subject: '🏆 Invitación a Quini Ranking',
      html: `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 48px; margin-bottom: 10px; }
              h1 { color: #1f2937; margin: 0; font-size: 24px; }
              .content { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
              .nickname { font-weight: bold; color: #ea580c; }
              .button { display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
              .button:hover { background-color: #d84a0a; }
              .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
              .expires { color: #f59e0b; font-size: 14px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🏆</div>
                <h1>Bienvenido a Quini Ranking</h1>
              </div>

              <div class="content">
                <p>¡Hola!</p>

                <p>Has sido invitado a unirse a <strong>Quini Ranking</strong>, el sistema justo de puntuación para la Quiniela.</p>

                <p>Tu nombre de usuario será: <span class="nickname">${nickname}</span></p>

                <p>Para completar tu registro y establecer tu contraseña, haz click en el siguiente botón:</p>

                <center>
                  <a href="${invitationUrl}" class="button">Aceptar Invitación</a>
                </center>

                <div class="expires">
                  ⏰ Este link es válido por <strong>30 días</strong> y puede usarse solo una vez.
                </div>

                <p>Si no esperabas esta invitación, puedes ignorar este email.</p>
              </div>

              <div class="footer">
                <p>Quini Ranking © 2026 | Sistema de ranking para la Quiniela</p>
                <p>Este es un email automático, no respondas a esta dirección.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (result.error) {
      console.error('Email error:', result.error)
      return { error: 'Error sending email' }
    }

    // Log email sent
    await db.emailLog.create({
      data: {
        email,
        subject: '🏆 Invitación a Quini Ranking',
        status: 'sent',
      },
    })

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('Email service error:', error)

    // Log error
    await db.emailLog.create({
      data: {
        email,
        subject: '🏆 Invitación a Quini Ranking',
        status: 'failed',
        error: String(error),
      },
    })

    return { error: 'Failed to send email' }
  }
}
