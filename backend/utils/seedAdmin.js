import User from '../models/User.js';

const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('Admin seed skipped: ADMIN_EMAIL / ADMIN_PASSWORD not configured.');
    return;
  }
  const exists = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (exists) return;
  await User.create({
    name: ADMIN_NAME || 'Platform Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log(`Demo admin seeded: ${ADMIN_EMAIL}`);
};

export default seedAdmin;