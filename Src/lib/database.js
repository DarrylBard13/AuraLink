import { sql } from '@vercel/postgres';

// Create users table if it doesn't exist
export async function createUsersTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        preferred_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
}

// Register a new user
export async function registerUser(name, email, password) {
  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return { success: false, error: 'User with this email already exists' };
    }

    // In production, you should hash the password
    // For now, storing plain text (will improve later)
    const result = await sql`
      INSERT INTO users (name, preferred_name, email, password_hash)
      VALUES (${name}, ${name}, ${email}, ${password})
      RETURNING id, name, preferred_name, email, created_at
    `;

    const user = result.rows[0];
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

// Login user
export async function loginUser(email, password) {
  try {
    const result = await sql`
      SELECT id, name, preferred_name, email, created_at
      FROM users
      WHERE email = ${email} AND password_hash = ${password}
    `;

    if (result.rows.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = result.rows[0];
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// Get user by ID
export async function getUserById(userId) {
  try {
    const result = await sql`
      SELECT id, name, preferred_name, email, created_at
      FROM users
      WHERE id = ${userId}
    `;

    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, error: 'Failed to get user' };
  }
}