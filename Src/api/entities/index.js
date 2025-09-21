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
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          const newBill = new Bill({
            ...billData,
            id: Date.now().toString(),
            userId: currentUser.id
          });

          // Get existing bills from localStorage
          const existingBills = JSON.parse(localStorage.getItem('auralink_bills') || '[]');

          // Add new bill
          existingBills.push(newBill);

          // Save back to localStorage
          localStorage.setItem('auralink_bills', JSON.stringify(existingBills));

          console.log('Created bill:', newBill);
          resolve(newBill);
        } catch (error) {
          console.error('Error creating bill:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async update(id, billData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Get existing bills from localStorage
          const existingBills = JSON.parse(localStorage.getItem('auralink_bills') || '[]');

          // Find and update the bill
          const billIndex = existingBills.findIndex(bill => bill.id === id && bill.userId === currentUser.id);

          if (billIndex === -1) {
            resolve({ success: false, error: 'Bill not found' });
            return;
          }

          const updatedBill = new Bill({
            ...existingBills[billIndex],
            ...billData,
            id,
            userId: currentUser.id,
            updatedAt: new Date()
          });

          existingBills[billIndex] = updatedBill;

          // Save back to localStorage
          localStorage.setItem('auralink_bills', JSON.stringify(existingBills));

          console.log('Updated bill:', updatedBill);
          resolve(updatedBill);
        } catch (error) {
          console.error('Error updating bill:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Get existing bills from localStorage
          const existingBills = JSON.parse(localStorage.getItem('auralink_bills') || '[]');

          // Filter out the bill to delete
          const filteredBills = existingBills.filter(bill => !(bill.id === id && bill.userId === currentUser.id));

          // Save back to localStorage
          localStorage.setItem('auralink_bills', JSON.stringify(filteredBills));

          console.log('Deleted bill:', id);
          resolve({ success: true, id });
        } catch (error) {
          console.error('Error deleting bill:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve([]);
            return;
          }

          // Get bills from localStorage
          const allBills = JSON.parse(localStorage.getItem('auralink_bills') || '[]');

          // Filter bills for current user
          const userBills = allBills
            .filter(bill => bill.userId === currentUser.id)
            .map(bill => new Bill(bill));

          resolve(userBills);
        } catch (error) {
          console.error('Error getting bills:', error);
          resolve([]);
        }
      }, 300);
    });
  }

  static async filter(criteria = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve([]);
            return;
          }

          // Get bills from localStorage
          const allBills = JSON.parse(localStorage.getItem('auralink_bills') || '[]');

          // Filter bills for current user and criteria
          const userBills = allBills
            .filter(bill => {
              if (bill.userId !== currentUser.id) return false;

              // Apply additional filter criteria
              for (const [key, value] of Object.entries(criteria)) {
                if (key === 'cycle') {
                  // For cycle filtering, check if bill's dueDate matches the cycle (YYYY-MM format)
                  if (bill.dueDate) {
                    try {
                      const billCycle = bill.dueDate.substring(0, 7); // Extract YYYY-MM from YYYY-MM-DD
                      if (billCycle !== value) return false;
                    } catch (e) {
                      return false;
                    }
                  } else {
                    return false;
                  }
                } else if (bill[key] !== value) {
                  return false;
                }
              }

              return true;
            })
            .map(bill => new Bill(bill));

          resolve(userBills);
        } catch (error) {
          console.error('Error filtering bills:', error);
          resolve([]);
        }
      }, 300);
    });
  }

  static async get(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve(null);
            return;
          }

          // Get bills from localStorage
          const allBills = JSON.parse(localStorage.getItem('auralink_bills') || '[]');

          // Find the specific bill
          const bill = allBills.find(bill => bill.id === id && bill.userId === currentUser.id);

          resolve(bill ? new Bill(bill) : null);
        } catch (error) {
          console.error('Error getting bill:', error);
          resolve(null);
        }
      }, 200);
    });
  }
}

export class BillTransaction {
  constructor(data = {}) {
    this.id = data.id || null;
    this.billId = data.billId || data.bill_id || null;
    this.amount = data.amount || 0;
    this.paidAt = data.paidAt || new Date();
    this.method = data.method || '';
    this.userId = data.userId || 'current-user';
    this.createdAt = data.createdAt || new Date();
  }

  static async create(transactionData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          const newTransaction = new BillTransaction({
            ...transactionData,
            id: Date.now().toString(),
            userId: currentUser.id
          });

          // Get existing transactions from localStorage
          const existingTransactions = JSON.parse(localStorage.getItem('auralink_bill_transactions') || '[]');

          // Add new transaction
          existingTransactions.push(newTransaction);

          // Save back to localStorage
          localStorage.setItem('auralink_bill_transactions', JSON.stringify(existingTransactions));

          console.log('Created bill transaction:', newTransaction);
          resolve(newTransaction);
        } catch (error) {
          console.error('Error creating bill transaction:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async list() {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve([]);
            return;
          }

          // Get transactions from localStorage
          const allTransactions = JSON.parse(localStorage.getItem('auralink_bill_transactions') || '[]');

          // Filter transactions for current user
          const userTransactions = allTransactions
            .filter(transaction => transaction.userId === currentUser.id)
            .map(transaction => new BillTransaction(transaction));

          resolve(userTransactions);
        } catch (error) {
          console.error('Error getting bill transactions:', error);
          resolve([]);
        }
      }, 300);
    });
  }

  static async getAll() {
    return BillTransaction.list();
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
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          const newSubscription = new Subscription({
            ...subscriptionData,
            id: Date.now().toString(),
            userId: currentUser.id
          });

          // Get existing subscriptions from localStorage
          const existingSubscriptions = JSON.parse(localStorage.getItem('auralink_subscriptions') || '[]');

          // Add new subscription
          existingSubscriptions.push(newSubscription);

          // Save back to localStorage
          localStorage.setItem('auralink_subscriptions', JSON.stringify(existingSubscriptions));

          console.log('Created subscription:', newSubscription);
          resolve(newSubscription);
        } catch (error) {
          console.error('Error creating subscription:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async update(id, subscriptionData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Get existing subscriptions from localStorage
          const existingSubscriptions = JSON.parse(localStorage.getItem('auralink_subscriptions') || '[]');

          // Find and update the subscription
          const subscriptionIndex = existingSubscriptions.findIndex(sub => sub.id === id && sub.userId === currentUser.id);

          if (subscriptionIndex === -1) {
            resolve({ success: false, error: 'Subscription not found' });
            return;
          }

          const updatedSubscription = new Subscription({
            ...existingSubscriptions[subscriptionIndex],
            ...subscriptionData,
            id,
            userId: currentUser.id,
            updatedAt: new Date()
          });

          existingSubscriptions[subscriptionIndex] = updatedSubscription;

          // Save back to localStorage
          localStorage.setItem('auralink_subscriptions', JSON.stringify(existingSubscriptions));

          console.log('Updated subscription:', updatedSubscription);
          resolve(updatedSubscription);
        } catch (error) {
          console.error('Error updating subscription:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Get existing subscriptions from localStorage
          const existingSubscriptions = JSON.parse(localStorage.getItem('auralink_subscriptions') || '[]');

          // Filter out the subscription to delete
          const filteredSubscriptions = existingSubscriptions.filter(sub => !(sub.id === id && sub.userId === currentUser.id));

          // Save back to localStorage
          localStorage.setItem('auralink_subscriptions', JSON.stringify(filteredSubscriptions));

          console.log('Deleted subscription:', id);
          resolve({ success: true, id });
        } catch (error) {
          console.error('Error deleting subscription:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve([]);
            return;
          }

          // Get subscriptions from localStorage
          const allSubscriptions = JSON.parse(localStorage.getItem('auralink_subscriptions') || '[]');

          // Filter subscriptions for current user
          const userSubscriptions = allSubscriptions
            .filter(sub => sub.userId === currentUser.id)
            .map(sub => new Subscription(sub));

          resolve(userSubscriptions);
        } catch (error) {
          console.error('Error getting subscriptions:', error);
          resolve([]);
        }
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
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          const newIncomeSource = new IncomeSource({
            ...incomeSourceData,
            id: Date.now().toString(),
            userId: currentUser.id
          });

          // Get existing income sources from localStorage
          const existingIncomeSources = JSON.parse(localStorage.getItem('auralink_income_sources') || '[]');

          // Add new income source
          existingIncomeSources.push(newIncomeSource);

          // Save back to localStorage
          localStorage.setItem('auralink_income_sources', JSON.stringify(existingIncomeSources));

          console.log('Created income source:', newIncomeSource);
          resolve(newIncomeSource);
        } catch (error) {
          console.error('Error creating income source:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async update(id, incomeSourceData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Get existing income sources from localStorage
          const existingIncomeSources = JSON.parse(localStorage.getItem('auralink_income_sources') || '[]');

          // Find and update the income source
          const incomeSourceIndex = existingIncomeSources.findIndex(source => source.id === id && source.userId === currentUser.id);

          if (incomeSourceIndex === -1) {
            resolve({ success: false, error: 'Income source not found' });
            return;
          }

          const updatedIncomeSource = new IncomeSource({
            ...existingIncomeSources[incomeSourceIndex],
            ...incomeSourceData,
            id,
            userId: currentUser.id,
            updatedAt: new Date()
          });

          existingIncomeSources[incomeSourceIndex] = updatedIncomeSource;

          // Save back to localStorage
          localStorage.setItem('auralink_income_sources', JSON.stringify(existingIncomeSources));

          console.log('Updated income source:', updatedIncomeSource);
          resolve(updatedIncomeSource);
        } catch (error) {
          console.error('Error updating income source:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Get existing income sources from localStorage
          const existingIncomeSources = JSON.parse(localStorage.getItem('auralink_income_sources') || '[]');

          // Filter out the income source to delete
          const filteredIncomeSources = existingIncomeSources.filter(source => !(source.id === id && source.userId === currentUser.id));

          // Save back to localStorage
          localStorage.setItem('auralink_income_sources', JSON.stringify(filteredIncomeSources));

          console.log('Deleted income source:', id);
          resolve({ success: true, id });
        } catch (error) {
          console.error('Error deleting income source:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve([]);
            return;
          }

          // Get income sources from localStorage
          const allIncomeSources = JSON.parse(localStorage.getItem('auralink_income_sources') || '[]');

          // Filter income sources for current user
          const userIncomeSources = allIncomeSources
            .filter(source => source.userId === currentUser.id)
            .map(source => new IncomeSource(source));

          resolve(userIncomeSources);
        } catch (error) {
          console.error('Error getting income sources:', error);
          resolve([]);
        }
      }, 300);
    });
  }

  static async list() {
    return IncomeSource.getAll();
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
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          const newLoggedIncome = new LoggedIncome({
            ...loggedIncomeData,
            id: Date.now().toString(),
            userId: currentUser.id
          });

          // Get existing logged incomes from localStorage
          const existingLoggedIncomes = JSON.parse(localStorage.getItem('auralink_logged_incomes') || '[]');

          // Add new logged income
          existingLoggedIncomes.push(newLoggedIncome);

          // Save back to localStorage
          localStorage.setItem('auralink_logged_incomes', JSON.stringify(existingLoggedIncomes));

          console.log('Created logged income:', newLoggedIncome);
          resolve(newLoggedIncome);
        } catch (error) {
          console.error('Error creating logged income:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async update(id, loggedIncomeData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Get existing logged incomes from localStorage
          const existingLoggedIncomes = JSON.parse(localStorage.getItem('auralink_logged_incomes') || '[]');

          // Find and update the logged income
          const loggedIncomeIndex = existingLoggedIncomes.findIndex(income => income.id === id && income.userId === currentUser.id);

          if (loggedIncomeIndex === -1) {
            resolve({ success: false, error: 'Logged income not found' });
            return;
          }

          const updatedLoggedIncome = new LoggedIncome({
            ...existingLoggedIncomes[loggedIncomeIndex],
            ...loggedIncomeData,
            id,
            userId: currentUser.id,
            updatedAt: new Date()
          });

          existingLoggedIncomes[loggedIncomeIndex] = updatedLoggedIncome;

          // Save back to localStorage
          localStorage.setItem('auralink_logged_incomes', JSON.stringify(existingLoggedIncomes));

          console.log('Updated logged income:', updatedLoggedIncome);
          resolve(updatedLoggedIncome);
        } catch (error) {
          console.error('Error updating logged income:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve({ success: false, error: 'No user found' });
            return;
          }

          // Get existing logged incomes from localStorage
          const existingLoggedIncomes = JSON.parse(localStorage.getItem('auralink_logged_incomes') || '[]');

          // Filter out the logged income to delete
          const filteredLoggedIncomes = existingLoggedIncomes.filter(income => !(income.id === id && income.userId === currentUser.id));

          // Save back to localStorage
          localStorage.setItem('auralink_logged_incomes', JSON.stringify(filteredLoggedIncomes));

          console.log('Deleted logged income:', id);
          resolve({ success: true, id });
        } catch (error) {
          console.error('Error deleting logged income:', error);
          resolve({ success: false, error: error.message });
        }
      }, 300);
    });
  }

  static async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve([]);
            return;
          }

          // Get logged incomes from localStorage
          const allLoggedIncomes = JSON.parse(localStorage.getItem('auralink_logged_incomes') || '[]');

          // Filter logged incomes for current user
          const userLoggedIncomes = allLoggedIncomes
            .filter(income => income.userId === currentUser.id)
            .map(income => new LoggedIncome(income));

          resolve(userLoggedIncomes);
        } catch (error) {
          console.error('Error getting logged incomes:', error);
          resolve([]);
        }
      }, 300);
    });
  }

  static async filter(criteria = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const currentUser = User.getCurrentUser();
          if (!currentUser) {
            resolve([]);
            return;
          }

          // Get logged incomes from localStorage
          const allLoggedIncomes = JSON.parse(localStorage.getItem('auralink_logged_incomes') || '[]');

          // Filter logged incomes for current user and criteria
          const userLoggedIncomes = allLoggedIncomes
            .filter(income => {
              if (income.userId !== currentUser.id) return false;

              // Apply additional filter criteria
              for (const [key, value] of Object.entries(criteria)) {
                if (income[key] !== value) return false;
              }

              return true;
            })
            .map(income => new LoggedIncome(income));

          resolve(userLoggedIncomes);
        } catch (error) {
          console.error('Error filtering logged incomes:', error);
          resolve([]);
        }
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