const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'user@example.com' }
    })

    if (existingUser) {
      console.log('Test user already exists:', existingUser.email)
      return
    }

    // Create test user
    const password = 'user123'
    const password_hash = await bcrypt.hash(password, 12)

    const testUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password_hash,
        name: 'Test User',
        role: 'user',
        is_active: true,
      },
    })

    console.log('Test user created successfully!')
    console.log('================================')
    console.log('Email:', testUser.email)
    console.log('Password:', password)
    console.log('Role:', testUser.role)
    console.log('Status:', testUser.is_active ? 'Active' : 'Inactive')
    console.log('\nThis user will have limited access (no admin dashboard).')
    
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
