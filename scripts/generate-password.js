import bcrypt from 'bcryptjs';

async function generatePasswordHash() {
  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL Command:');
  console.log(`INSERT INTO users (username, password_hash, email, role) VALUES ('admin', '${hash}', 'admin@bsi.com', 'admin');`);
}

generatePasswordHash();
