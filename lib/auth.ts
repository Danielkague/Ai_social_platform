export interface User {
  id: number
  username: string
  email: string
  fullName: string
  password: string // Add password field
  joinDate: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Mock user database - replace with your actual database
const users: User[] = []
let userIdCounter = 1

export const authService = {
  async register(userData: {
    username: string
    email: string
    password: string
    fullName: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    // Check if user already exists
    const existingUser = users.find((u) => u.email === userData.email || u.username === userData.username)

    if (existingUser) {
      return {
        success: false,
        error: "User with this email or username already exists",
      }
    }

    // Create new user
    const newUser: User = {
      id: userIdCounter++,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      password: userData.password, // Store password
      joinDate: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.fullName}`,
    }

    users.push(newUser)

    return { success: true, user: newUser }
  },

  async login(credentials: {
    emailOrUsername: string
    password: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    // Find user by email or username
    const user = users.find(
      (u) => u.email === credentials.emailOrUsername || u.username === credentials.emailOrUsername
    )

    if (!user || user.password !== credentials.password) {
      return { success: false, error: "Invalid email/username or password" }
    }
    return { success: true, user }
  },

  async getCurrentUser(): Promise<User | null> {
    // In a real app, this would verify a JWT token or session
    const userData = localStorage.getItem("currentUser")
    return userData ? JSON.parse(userData) : null
  },

  logout(): void {
    localStorage.removeItem("currentUser")
  },
}
