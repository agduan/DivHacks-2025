import bcrypt from 'bcryptjs';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  balance: number;
  createdAt: string;
  lastLogin: string;
  customerId?: string;
}

// In-memory database with persistent storage for demo purposes
// In production, this would be a real database like PostgreSQL, MongoDB, etc.
class UserDatabase {
  private users: Map<string, StoredUser> = new Map();
  private emailToId: Map<string, string> = new Map();
  private storageKey = 'financial_time_machine_users';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load users from localStorage
   */
  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          this.users = new Map(data.users || []);
          this.emailToId = new Map(data.emailToId || []);
          console.log(`Loaded ${this.users.size} users from storage`);
        }
      }
    } catch (error) {
      console.error('Error loading users from storage:', error);
    }
  }

  /**
   * Save users to localStorage
   */
  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        const data = {
          users: Array.from(this.users.entries()),
          emailToId: Array.from(this.emailToId.entries()),
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        console.log(`Saved ${this.users.size} users to storage`);
      }
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(email: string, password: string, name: string): Promise<StoredUser> {
    // Check if user already exists
    if (this.emailToId.has(email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerId = `customer_${userId}`;
    
    const user: StoredUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      passwordHash,
      balance: 100.00, // Starting balance
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      customerId,
    };

    // Store user
    this.users.set(userId, user);
    this.emailToId.set(email.toLowerCase(), userId);
    
    // Save to persistent storage
    this.saveToStorage();

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<StoredUser | null> {
    const userId = this.emailToId.get(email.toLowerCase());
    if (!userId) {
      return null;
    }
    return this.users.get(userId) || null;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<StoredUser | null> {
    return this.users.get(id) || null;
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<StoredUser | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.users.set(user.id, user);
    
    // Save to persistent storage
    this.saveToStorage();

    return user;
  }

  /**
   * Update user balance
   */
  async updateBalance(userId: string, newBalance: number): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    user.balance = newBalance;
    this.users.set(userId, user);
    
    // Save to persistent storage
    this.saveToStorage();
    
    return true;
  }

  /**
   * Get all users (for admin purposes)
   */
  async getAllUsers(): Promise<StoredUser[]> {
    return Array.from(this.users.values());
  }

  /**
   * Delete user (permanent deletion)
   */
  async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    // Remove user from all storage
    this.users.delete(userId);
    this.emailToId.delete(user.email);
    
    // Save to persistent storage
    this.saveToStorage();
    
    console.log(`Permanently deleted user: ${user.email} (${userId})`);
    return true;
  }

  /**
   * Delete user by email
   */
  async deleteUserByEmail(email: string): Promise<boolean> {
    const userId = this.emailToId.get(email.toLowerCase());
    if (!userId) {
      return false;
    }
    
    return this.deleteUser(userId);
  }

  /**
   * Get user count (for statistics)
   */
  getUserCount(): number {
    return this.users.size;
  }
}

// Create singleton instance
export const userDatabase = new UserDatabase();

// Helper function to convert StoredUser to EchoUser format
export function storedUserToEchoUser(storedUser: StoredUser) {
  return {
    id: storedUser.id,
    email: storedUser.email,
    name: storedUser.name,
    balance: storedUser.balance,
    createdAt: storedUser.createdAt,
    lastLogin: storedUser.lastLogin,
    customerId: storedUser.customerId,
  };
}
