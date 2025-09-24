const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    const email = 'rohith@gmail.com'
    const newPassword = 'admin123' // Change this to your preferred password
    
    // Hash the new password
    const password_hash = await bcrypt.hash(newPassword, 12)
    
    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password_hash },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
      }
    })

    console.log('Password reset successfully!')
    console.log('================================')
    console.log('Email:', updatedUser.email)
    console.log('Password:', newPassword)
    console.log('Role:', updatedUser.role)
    console.log('Status:', updatedUser.is_active ? 'Active' : 'Inactive')
    console.log('\nYou can now log in with these credentials.')
    console.log('⚠️  Remember to change the password after logging in!')
    
  } catch (error) {
    console.error('Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
