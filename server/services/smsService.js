import twilio from 'twilio';

const isSmsConfigured =
  !!process.env.TWILIO_ACCOUNT_SID &&
  !!process.env.TWILIO_AUTH_TOKEN &&
  !!process.env.TWILIO_VERIFY_SERVICE_SID;

const client = isSmsConfigured
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const isSmsServiceConfigured = isSmsConfigured;

export const startPhoneVerification = async (phone) => {
  if (!isSmsConfigured) {
    throw new Error('SMS service is not configured on this server.');
  }

  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: phone, channel: 'sms' });
};

export const checkPhoneVerification = async (phone, code) => {
  if (!isSmsConfigured) {
    throw new Error('SMS service is not configured on this server.');
  }

  const result = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: phone, code });

  return result.status === 'approved';
};
