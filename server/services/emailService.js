import { Resend } from 'resend';

const isEmailConfigured = !!process.env.RESEND_API_KEY;

const resend = isEmailConfigured ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'NJobs <onboarding@resend.dev>';

export const isEmailServiceConfigured = isEmailConfigured;

const buildResetEmailHtml = (name, resetUrl) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your NJobs password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#FAFAF8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAF8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E8E6E0;">
            <tr>
              <td style="padding:32px 32px 24px 32px;text-align:center;border-bottom:1px solid #E8E6E0;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="width:36px;height:36px;background-color:#0F766E;border-radius:10px;text-align:center;vertical-align:middle;">
                      <span style="color:#FFFFFF;font-size:18px;font-weight:700;line-height:36px;">N</span>
                    </td>
                    <td style="padding-left:10px;font-size:18px;font-weight:700;color:#14151A;">
                      N<span style="color:#0F766E;">Jobs</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px 32px;">
                <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:#14151A;">Reset your password</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#5B5E6B;">
                  Hi ${name || 'there'},<br /><br />
                  We received a request to reset the password for your NJobs account. Click the button
                  below to choose a new password. This link will expire in <strong>5 minutes</strong> for
                  your security.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;text-align:center;">
                <a href="${resetUrl}" target="_blank" style="display:inline-block;background-color:#0F766E;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
                  Reset Password
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#8A8D99;">
                  If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#0F766E;word-break:break-all;">
                  ${resetUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#F3F2EE;border-top:1px solid #E8E6E0;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#8A8D99;">
                  If you didn't request this, you can safely ignore this email — your password will
                  remain unchanged. This link can only be used once and expires automatically.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0 0;font-size:12px;color:#C7C9D1;">
            © ${new Date().getFullYear()} NJobs. This is an automated message, please don't reply.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  if (!isEmailConfigured) {
    throw new Error('Email service is not configured on this server.');
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Reset your NJobs password',
    html: buildResetEmailHtml(name, resetUrl),
  });
};

const buildVerificationEmailHtml = (name, verifyUrl) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your NJobs email</title>
  </head>
  <body style="margin:0;padding:0;background-color:#FAFAF8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAF8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E8E6E0;">
            <tr>
              <td style="padding:32px 32px 24px 32px;text-align:center;border-bottom:1px solid #E8E6E0;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="width:36px;height:36px;background-color:#0F766E;border-radius:10px;text-align:center;vertical-align:middle;">
                      <span style="color:#FFFFFF;font-size:18px;font-weight:700;line-height:36px;">N</span>
                    </td>
                    <td style="padding-left:10px;font-size:18px;font-weight:700;color:#14151A;">
                      N<span style="color:#0F766E;">Jobs</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px 32px;">
                <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:#14151A;">Confirm your email address</h1>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#5B5E6B;">
                  Hi ${name || 'there'},<br /><br />
                  Welcome to NJobs! Please confirm that this is your email address by clicking the
                  button below. This helps keep your account secure and ensures employers and
                  applicants can reach you.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;text-align:center;">
                <a href="${verifyUrl}" target="_blank" style="display:inline-block;background-color:#0F766E;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
                  Verify Email Address
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#8A8D99;">
                  If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#0F766E;word-break:break-all;">
                  ${verifyUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#F3F2EE;border-top:1px solid #E8E6E0;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#8A8D99;">
                  If you didn't create an NJobs account, you can safely ignore this email.
                  This link expires in 24 hours.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0 0;font-size:12px;color:#C7C9D1;">
            © ${new Date().getFullYear()} NJobs. This is an automated message, please don't reply.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
  if (!isEmailConfigured) {
    throw new Error('Email service is not configured on this server.');
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Verify your NJobs email address',
    html: buildVerificationEmailHtml(name, verifyUrl),
  });
};
