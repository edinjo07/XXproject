import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123456', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // Create sample creator
  const creatorPassword = await bcrypt.hash(process.env.SEED_CREATOR_PASSWORD || 'creator123456', 12)
  
  const creator = await prisma.user.upsert({
    where: { email: 'creator@example.com' },
    update: {},
    create: {
      email: 'creator@example.com',
      username: 'creator1',
      password: creatorPassword,
      role: 'CREATOR',
      isVerified: true,
      bio: 'Sample creator account for testing',
    },
  })

  console.log('✅ Created creator user:', creator.email)

  // Create platform settings
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      payoutRatePer1000: 5.0,
      minimumPayoutAmount: 50.0,
      platformName: 'Video Platform',
    },
  })

  console.log('✅ Created platform settings')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📝 Test Accounts:')
  console.log('   Admin:')
  console.log('     Email: admin@example.com')
  console.log('     Password: admin123456')
  console.log('\n   Creator:')
  console.log('     Email: creator@example.com')
  console.log('     Password: creator123456')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
