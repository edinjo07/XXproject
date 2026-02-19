const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const categories = [
  {
    name: 'Amateur',
    slug: 'amateur',
    icon: '🎥',
    color: '#ff006e',
    description: 'User-generated amateur content',
    order: 1
  },
  {
    name: 'Popular',
    slug: 'popular',
    icon: '🔥',
    color: '#fb5607',
    description: 'Trending and most viewed videos',
    order: 2
  },
  {
    name: 'New Releases',
    slug: 'new-releases',
    icon: '⭐',
    color: '#ffbe0b',
    description: 'Fresh content uploaded recently',
    order: 3
  },
  {
    name: 'HD Quality',
    slug: 'hd',
    icon: '📹',
    color: '#8338ec',
    description: 'High definition videos',
    order: 4
  },
  {
    name: 'Featured Creators',
    slug: 'featured-creators',
    icon: '👤',
    color: '#3a86ff',
    description: 'Content from verified creators',
    order: 5
  },
  {
    name: 'Compilations',
    slug: 'compilations',
    icon: '📦',
    color: '#06d6a0',
    description: 'Collections and compilations',
    order: 6
  },
  {
    name: 'Short Clips',
    slug: 'short-clips',
    icon: '⚡',
    color: '#ef476f',
    description: 'Quick videos under 5 minutes',
    order: 7
  },
  {
    name: 'Long Form',
    slug: 'long-form',
    icon: '🎬',
    color: '#073b4c',
    description: 'Extended content over 15 minutes',
    order: 8
  }
]

async function main() {
  console.log('🌱 Seeding categories...')

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    console.log(`✅ Created/Updated category: ${category.name}`)
  }

  console.log('✨ Categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
