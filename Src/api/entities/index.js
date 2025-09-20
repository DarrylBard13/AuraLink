// Entity definitions for AuraLink
// These would typically be defined based on your database schema

export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.createdAt = data.createdAt || new Date();
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
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}