import User from '../models/User.js';

export const ensureAdminAccount = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account bootstrap.');
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existingAdmin) return;

  await User.create({
    name: 'Platform Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });

  console.log(`Admin account created: ${adminEmail}`);
};
