const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
    const password = 'admin123' // Change this to a secure password
    const password_hash = await bcrypt.hash(password, 12)

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password_hash,
        name: 'System Administrator',
        role: 'admin',
        is_active: true,
      },
    })

    console.log('Admin user created successfully!')
    console.log('Email:', adminUser.email)
    console.log('Password: admin123')
    console.log('Role:', adminUser.role)
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
