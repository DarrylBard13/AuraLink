// API functions for authentication (client-side)
// This will call server endpoints instead of direct database access

export async function loginUser(email, password) {
  // Use localStorage for now - database integration needs server-side API
  return loginUserLocal(email, password);
}

export async function registerUser(name, email, password) {
  // Use localStorage for now - database integration needs server-side API
  return registerUserLocal(name, email, password);
}

// Fallback localStorage functions
function loginUserLocal(email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const existingUsers = JSON.parse(localStorage.getItem('auralink_users') || '[]');
        const existingUser = existingUsers.find(user =>
          user.email === email && user.password === password
        );

        if (existingUser) {
          const { password: _, ...userData } = existingUser;
          resolve({ success: true, user: userData });
        } else {
          resolve({ success: false, error: 'Invalid email or password' });
        }
      } catch (error) {
        console.error('Login error:', error);
        resolve({ success: false, error: 'Login failed' });
      }
    }, 1000);
  });
}

function registerUserLocal(name, email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const existingUsers = JSON.parse(localStorage.getItem('auralink_users') || '[]');
        const existingUser = existingUsers.find(user => user.email === email);

        if (existingUser) {
          resolve({ success: false, error: 'User with this email already exists' });
          return;
        }

        const newUser = {
          id: 'user_' + Date.now(),
          name: name,
          preferred_name: name,
          email: email,
          password: password,
          createdAt: new Date().toISOString()
        };

        existingUsers.push(newUser);
        localStorage.setItem('auralink_users', JSON.stringify(existingUsers));

        const { password: _, ...userData } = newUser;
        resolve({ success: true, user: userData });
      } catch (error) {
        console.error('Registration error:', error);
        resolve({ success: false, error: 'Registration failed' });
      }
    }, 1000);
  });
}