import { userDatabase, storedUserToEchoUser } from './userDatabase';

export interface EchoUser {
  id: string;
  email: string;
  name: string;
  customerId?: string; // Nessie customer ID
  balance: number;
  createdAt: string;
  lastLogin: string;
}

export interface EchoAuthResponse {
  success: boolean;
  user?: EchoUser;
  token?: string;
  error?: string;
}

export interface EchoBillingInfo {
  balance: number;
  creditsUsed: number;
  totalSpent: number;
  lastTransaction: string;
}

export class EchoAuthService {
  private static baseUrl = process.env.ECHO_API_ENDPOINT || 'https://echo.merit.systems';
  private static apiKey: string | null = null;
  private static appId: string | null = null;

  /**
   * Initialize Echo Auth with API key and app ID
   */
  static initialize(apiKey: string, appId: string) {
    this.apiKey = apiKey;
    this.appId = appId;
  }

  /**
   * Sign up a new user
   */
  static async signUp(email: string, password: string, name: string): Promise<EchoAuthResponse> {
    if (!this.apiKey || !this.appId) {
      throw new Error('Echo API not initialized');
    }

    try {
      // Validate input
      if (!email || !password || !name) {
        return {
          success: false,
          error: 'Email, password, and name are required',
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long',
        };
      }

      // Check if user already exists
      const existingUser = await userDatabase.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Create user in database
      const storedUser = await userDatabase.createUser(email, password, name);
      const echoUser = storedUserToEchoUser(storedUser);
      
      // Generate token
      const token = `demo_token_${storedUser.id}`;

      return {
        success: true,
        user: echoUser,
        token: token,
      };
    } catch (error) {
      console.error('Echo signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(email: string, password: string): Promise<EchoAuthResponse> {
    if (!this.apiKey || !this.appId) {
      throw new Error('Echo API not initialized');
    }

    try {
      // Validate input
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      // Verify credentials against database
      const storedUser = await userDatabase.verifyPassword(email, password);
      if (!storedUser) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Convert to EchoUser format
      const echoUser = storedUserToEchoUser(storedUser);
      
      // Generate token
      const token = `demo_token_${storedUser.id}`;

      return {
        success: true,
        user: echoUser,
        token: token,
      };
    } catch (error) {
      console.error('Echo signin error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signin failed',
      };
    }
  }

  /**
   * Get user billing information
   */
  static async getBillingInfo(userId: string, token: string): Promise<EchoBillingInfo> {
    if (!this.apiKey || !this.appId) {
      throw new Error('Echo API not initialized');
    }

    try {
      // Get user from database
      const storedUser = await userDatabase.findById(userId);
      if (!storedUser) {
        throw new Error('User not found');
      }

      // Return billing info from database
      return {
        balance: storedUser.balance,
        creditsUsed: Math.max(0, 100.00 - storedUser.balance), // Calculate credits used
        totalSpent: Math.max(0, 100.00 - storedUser.balance), // Calculate total spent
        lastTransaction: storedUser.lastLogin,
      };
    } catch (error) {
      console.error('Echo billing error:', error);
      // Return mock billing info for demo
      return {
        balance: 100.00,
        creditsUsed: 15.50,
        totalSpent: 25.00,
        lastTransaction: new Date().toISOString(),
      };
    }
  }

  /**
   * Charge user for AI prediction
   */
  static async chargeUser(userId: string, token: string, cost: number, description: string): Promise<boolean> {
    if (!this.apiKey || !this.appId) {
      throw new Error('Echo API not initialized');
    }

    try {
      // Get user from database
      const storedUser = await userDatabase.findById(userId);
      if (!storedUser) {
        console.error('User not found for charging');
        return false;
      }

      // Check if user has sufficient balance
      if (storedUser.balance < cost) {
        console.error('Insufficient balance for charge');
        return false;
      }

      // Deduct cost from balance
      const newBalance = storedUser.balance - cost;
      const success = await userDatabase.updateBalance(userId, newBalance);
      
      if (success) {
        console.log(`Charged user ${userId} $${cost} for: ${description}. New balance: $${newBalance}`);
      }

      return success;
    } catch (error) {
      console.error('Echo charge error:', error);
      return false;
    }
  }

  /**
   * Create or link Nessie customer ID for user
   */
  static async createNessieCustomer(userId: string, token: string, userInfo: {
    firstName: string;
    lastName: string;
    address: {
      streetNumber: string;
      streetName: string;
      city: string;
      state: string;
      zip: string;
    };
  }): Promise<string | null> {
    try {
      // This would integrate with Nessie API to create a customer
      // For now, return a mock customer ID
      const mockCustomerId = `customer_${userId}_${Date.now()}`;
      
      // In a real implementation, you would:
      // 1. Call Nessie API to create customer
      // 2. Store the customer ID in your database
      // 3. Link it to the Echo user account
      
      return mockCustomerId;
    } catch (error) {
      console.error('Error creating Nessie customer:', error);
      return null;
    }
  }

  /**
   * Get user's Nessie customer ID
   */
  static async getNessieCustomerId(userId: string, token: string): Promise<string | null> {
    try {
      // In a real implementation, this would query your database
      // For demo purposes, return a mock customer ID
      return `customer_${userId}`;
    } catch (error) {
      console.error('Error getting Nessie customer ID:', error);
      return null;
    }
  }

  /**
   * Delete user account permanently
   */
  static async deleteAccount(userId: string, token: string): Promise<boolean> {
    if (!this.apiKey || !this.appId) {
      throw new Error('Echo API not initialized');
    }

    try {
      // Verify token first
      const user = await this.verifyToken(token);
      if (!user || user.id !== userId) {
        return false;
      }

      // Delete user from database
      const deleted = await userDatabase.deleteUser(userId);
      if (!deleted) {
        return false;
      }

      console.log(`Account permanently deleted for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('Echo delete account error:', error);
      return false;
    }
  }

  /**
   * Verify user token
   */
  static async verifyToken(token: string): Promise<EchoUser | null> {
    if (!this.apiKey || !this.appId) {
      throw new Error('Echo API not initialized');
    }

    try {
      // Check if it's a demo token
      if (token.startsWith('demo_token_')) {
        // Extract user ID from token
        const userId = token.replace('demo_token_', '');
        
        // Look up user in database
        const storedUser = await userDatabase.findById(userId);
        if (!storedUser) {
          return null;
        }

        // Convert to EchoUser format
        return storedUserToEchoUser(storedUser);
      }

      // For real Echo API tokens, make the actual API call
      const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-App-ID': this.appId,
        },
      });

      if (!response.ok) {
        return null;
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        return null;
      }

      return data.user;
    } catch (error) {
      console.error('Echo token verification error:', error);
      return null;
    }
  }
}
