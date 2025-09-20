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

  static async me() {
    // Mock current user data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new User({
          id: '1',
          name: 'Demo User',
          preferred_name: 'Demo',
          full_name: 'Demo User',
          email: 'demo@auralink.app',
          backup_email: '',
          role: 'admin'
        }));
      }, 500);
    });
  }

  static async updateMyUserData(userData) {
    // Mock update user data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          user: new User({
            id: '1',
            name: userData.preferred_name || 'Demo User',
            preferred_name: userData.preferred_name,
            full_name: userData.preferred_name || 'Demo User',
            email: userData.email || 'demo@auralink.app',
            backup_email: userData.backup_email || '',
            role: 'admin'
          })
        });
      }, 1000);
    });
  }
}

export class Bill {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.amount = data.amount || 0;
    this.dueDate = data.dueDate || null;
    this.category = data.category || '';
    this.userId = data.userId || null;
    this.isPaid = data.isPaid || false;
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
    this.userId = data.userId || null;
    this.isActive = data.isActive || true;
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
    this.userId = data.userId || null;
  }
}

export class LoggedIncome {
  constructor(data = {}) {
    this.id = data.id || null;
    this.sourceId = data.sourceId || null;
    this.amount = data.amount || 0;
    this.receivedAt = data.receivedAt || new Date();
    this.description = data.description || '';
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
        resolve([
          new StickyNote({
            id: '1',
            title: 'Welcome Note',
            content: 'Welcome to AuraLink! This is your first sticky note.',
            color: 'yellow',
            gridRow: 1,
            gridCol: 1,
            archived: false
          }),
          new StickyNote({
            id: '2',
            title: 'Feature Ideas',
            content: 'Add dark mode toggle\nImprove mobile responsiveness\nAdd export functionality',
            color: 'blue',
            gridRow: 1,
            gridCol: 11,
            archived: false
          })
        ].filter(note => {
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
        resolve({ success: true, id, data });
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
        resolve(new StickyNote({
          ...data,
          id: data.id || Date.now().toString()
        }));
      }, 500);
    });
  }
}