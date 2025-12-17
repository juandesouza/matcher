import { PrismaClient } from '@prisma/client';
import { Scrypt } from 'lucia';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'juandesouza7@gmail.com';
    const newPassword = 'test123'; // Change this to the desired password
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      await prisma.$disconnect();
      return;
    }

    console.log('✅ User found:', user.email, user.name);
    
    // Hash the new password using Scrypt (same as Lucia uses)
    const scrypt = new Scrypt();
    const hashedPassword = await scrypt.hash(newPassword);
    
    // Find or create key
    const keyId = `email:${email.toLowerCase()}`;
    
    await prisma.key.upsert({
      where: { id: keyId },
      update: {
        hashedPassword: hashedPassword
      },
      create: {
        id: keyId,
        userId: user.id,
        providerId: 'email',
        providerUserId: email.toLowerCase(),
        hashedPassword: hashedPassword
      }
    });

    console.log('✅ Password reset successfully!');
    console.log('   New password:', newPassword);
    console.log('   You can now log in with this password');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();

