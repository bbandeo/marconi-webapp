#!/usr/bin/env node

/**
 * Script to create a user via the API
 * Usage: node scripts/create-user.js
 */

async function createUser() {
  const userData = {
    email: 'bbandeo@marconi.com',
    password: 'nectarine',
    full_name: 'BBandeo User',
    role: 'admin'
  }

  try {
    const response = await fetch('http://localhost:3001/api/auth/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ User created successfully!')
      console.log('Email:', userData.email)
      console.log('Password:', userData.password)
      console.log('User ID:', result.user.id)
    } else {
      console.error('❌ Failed to create user:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Make sure the development server is running with: pnpm local')
  }
}

// Check if we're being run directly
if (require.main === module) {
  createUser()
}

module.exports = { createUser }