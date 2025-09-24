const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    })

    console.log('Current users in the database:')
    console.log('================================')
    
    if (users.length === 0) {
      console.log('No users found in the database.')
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Status: ${user.is_active ? 'Active' : 'Inactive'}`)
        console.log(`   Created: ${user.created_at.toISOString()}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
