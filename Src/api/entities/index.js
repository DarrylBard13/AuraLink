// Entity definitions for AuraLink
// These would typically be defined based on your database schema

export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.preferred_name = data.preferred_name || data.name || '';
    this.full_name = data.full_name || data.name || '';
    this.email = data.email || '';
    this.backup_email = data.backup_email || '';
    this.role = data.role || 'admin';
    this.createdAt = data.createdAt || new Date();
  }

  static getCurrentUser() {
    try {
      const savedUser = localStorage.getItem('auralink_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  }

  static async me() {
    // Get current authenticated user
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        if (currentUser) {
          resolve(new User(currentUser));
        } else {
          resolve(null);
        }
      }, 100);
    });
  }

  static async updateMyUserData(userData) {
    // Update user data and persist to localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Get current user from localStorage
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Create updated user object
          const updatedUser = {
            ...currentUser,
            preferred_name: userData.preferred_name || currentUser.preferred_name,
            email: userData.email || currentUser.email,
            backup_email: userData.backup_email || currentUser.backup_email,
            name: userData.preferred_name || currentUser.name,
            full_name: userData.preferred_name || currentUser.full_name
          };

          // Save updated user back to localStorage
          localStorage.setItem('auralink_user', JSON.stringify(updatedUser));

          resolve({
            success: true,
            user: new User(updatedUser)
          });
        } catch (error) {
          console.error('Error updating user data:', error);
          resolve({ success: false, error: error.message });
        }
      }, 500);
    });
  }
}

export class Bill {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.amount = data.amount || 0;
    this.amountOriginal = data.amountOriginal || data.amount || 0;
    this.dueDate = data.dueDate || null;
    this.category = data.category || '';
    this.recurring = data.recurring || 'none';
    this.cycle = data.cycle || null;
    this.notes = data.notes || '';
    this.userId = data.userId || 'current-user';
    this.isPaid = data.isPaid || false;
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(billData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const newBill = new Bill({
          ...billData,
          id: Date.now().toString(),
          userId: currentUser?.id || 'anonymous'
        });
        console.log('Created bill:', newBill);
        resolve(newBill);
      }, 500);
    });
  }

  static async update(id, billData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const updatedBill = new Bill({
          ...billData,
          id,
          userId: currentUser?.id || 'anonymous',
          updatedAt: new Date()
        });
        console.log('Updated bill:', updatedBill);
        resolve(updatedBill);
      }, 500);
    });
  }

  static async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Deleted bill:', id);
        resolve({ success: true, id });
      }, 300);
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const bills = currentUser ? [
          new Bill({
            id: '1',
            name: 'Sample Electric Bill',
            amountOriginal: 120.50,
            dueDate: '2024-02-15',
            category: 'Utilities',
            recurring: 'monthly',
            notes: 'Electric company bill',
            userId: currentUser.id
          })
        ] : [];
        resolve(bills);
      }, 300);
    });
  }
}

export class BillTransaction {
  constructor(data = {}) {
    this.id = data.id || null;
    this.billId = data.billId || null;
    this.amount = data.amount || 0;
    this.paidAt = data.paidAt || new Date();
    this.method = data.method || '';
  }
}

export class Subscription {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.amount = data.amount || 0;
    this.billingCycle = data.billingCycle || 'monthly';
    this.nextBillingDate = data.nextBillingDate || null;
    this.userId = data.userId || 'current-user';
    this.isActive = data.isActive || true;
    this.category = data.category || 'Entertainment';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(subscriptionData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const newSubscription = new Subscription({
          ...subscriptionData,
          id: Date.now().toString(),
          userId: currentUser?.id || 'anonymous'
        });
        console.log('Created subscription:', newSubscription);
        resolve(newSubscription);
      }, 500);
    });
  }

  static async update(id, subscriptionData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const updatedSubscription = new Subscription({
          ...subscriptionData,
          id,
          userId: currentUser?.id || 'anonymous',
          updatedAt: new Date()
        });
        console.log('Updated subscription:', updatedSubscription);
        resolve(updatedSubscription);
      }, 500);
    });
  }

  static async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Deleted subscription:', id);
        resolve({ success: true, id });
      }, 300);
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const subscriptions = currentUser ? [
          new Subscription({
            id: '1',
            name: 'Netflix',
            amount: 15.99,
            billingCycle: 'monthly',
            nextBillingDate: '2024-02-20',
            category: 'Entertainment',
            userId: currentUser.id
          })
        ] : [];
        resolve(subscriptions);
      }, 300);
    });
  }
}

export class Budget {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.totalAmount = data.totalAmount || 0;
    this.spentAmount = data.spentAmount || 0;
    this.period = data.period || 'monthly';
    this.userId = data.userId || null;
  }
}

export class IncomeSource {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.amount = data.amount || 0;
    this.frequency = data.frequency || 'monthly';
    this.userId = data.userId || 'current-user';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(incomeSourceData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const newIncomeSource = new IncomeSource({
          ...incomeSourceData,
          id: Date.now().toString(),
          userId: currentUser?.id || 'anonymous'
        });
        console.log('Created income source:', newIncomeSource);
        resolve(newIncomeSource);
      }, 500);
    });
  }

  static async update(id, incomeSourceData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const updatedIncomeSource = new IncomeSource({
          ...incomeSourceData,
          id,
          userId: currentUser?.id || 'anonymous',
          updatedAt: new Date()
        });
        console.log('Updated income source:', updatedIncomeSource);
        resolve(updatedIncomeSource);
      }, 500);
    });
  }

  static async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Deleted income source:', id);
        resolve({ success: true, id });
      }, 300);
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const incomeSources = currentUser ? [
          new IncomeSource({
            id: '1',
            name: 'Primary Job',
            amount: 4500.00,
            frequency: 'monthly',
            userId: currentUser.id
          })
        ] : [];
        resolve(incomeSources);
      }, 300);
    });
  }
}

export class LoggedIncome {
  constructor(data = {}) {
    this.id = data.id || null;
    this.sourceId = data.sourceId || null;
    this.amount = data.amount || 0;
    this.receivedAt = data.receivedAt || new Date();
    this.description = data.description || '';
    this.userId = data.userId || 'current-user';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(loggedIncomeData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const newLoggedIncome = new LoggedIncome({
          ...loggedIncomeData,
          id: Date.now().toString(),
          userId: currentUser?.id || 'anonymous'
        });
        console.log('Created logged income:', newLoggedIncome);
        resolve(newLoggedIncome);
      }, 500);
    });
  }

  static async update(id, loggedIncomeData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const updatedLoggedIncome = new LoggedIncome({
          ...loggedIncomeData,
          id,
          userId: currentUser?.id || 'anonymous',
          updatedAt: new Date()
        });
        console.log('Updated logged income:', updatedLoggedIncome);
        resolve(updatedLoggedIncome);
      }, 500);
    });
  }

  static async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Deleted logged income:', id);
        resolve({ success: true, id });
      }, 300);
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const loggedIncomes = currentUser ? [
          new LoggedIncome({
            id: '1',
            sourceId: '1',
            amount: 4500.00,
            receivedAt: new Date(),
            description: 'Monthly salary',
            userId: currentUser.id
          })
        ] : [];
        resolve(loggedIncomes);
      }, 300);
    });
  }

  static async filter(criteria = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const loggedIncomes = currentUser ? [
          new LoggedIncome({
            id: '1',
            sourceId: '1',
            amount: 4500.00,
            receivedAt: new Date(),
            description: 'Monthly salary',
            userId: currentUser.id
          })
        ] : [];

        resolve(loggedIncomes.filter(income => {
          if (criteria.entryHash && income.entryHash !== criteria.entryHash) return false;
          return true;
        }));
      }, 300);
    });
  }
}

export class StickyNote {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.content = data.content || '';
    this.color = data.color || 'yellow';
    this.userId = data.userId || null;
    this.gridRow = data.gridRow || null;
    this.gridCol = data.gridCol || null;
    this.rowSpan = data.rowSpan || 10;
    this.colSpan = data.colSpan || 10;
    this.archived = data.archived || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async filter(criteria = {}) {
    // Mock filter notes
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        const notes = currentUser ? [
          new StickyNote({
            id: '1',
            title: 'Welcome Note',
            content: 'Welcome to AuraLink! This is your first sticky note.',
            color: 'yellow',
            gridRow: 1,
            gridCol: 1,
            archived: false,
            userId: currentUser.id
          }),
          new StickyNote({
            id: '2',
            title: 'Feature Ideas',
            content: 'Add dark mode toggle\nImprove mobile responsiveness\nAdd export functionality',
            color: 'blue',
            gridRow: 1,
            gridCol: 11,
            archived: false,
            userId: currentUser.id
          })
        ] : [];

        resolve(notes.filter(note => {
          if (criteria.archived !== undefined) {
            return note.archived === criteria.archived;
          }
          return true;
        }));
      }, 300);
    });
  }

  static async update(id, data) {
    // Mock update note
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        resolve({
          success: true,
          id,
          data: { ...data, userId: currentUser?.id }
        });
      }, 500);
    });
  }

  static async delete(id) {
    // Mock delete note
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id });
      }, 500);
    });
  }

  static async save(data) {
    // Mock save note
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = User.getCurrentUser();
        resolve(new StickyNote({
          ...data,
          id: data.id || Date.now().toString(),
          userId: currentUser?.id || 'anonymous'
        }));
      }, 500);
    });
  }
}