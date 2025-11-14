export type Asset = {
    id: string;
    userId: string;
    type: 'bank' | 'investment' | 'realEstate' | 'crypto' | 'other';
    name: string;
    institution: string;
    value: number;
    currency: string;
    tags?: string[];
    details?: string;
    updatedAt: string;
    createdAt: string;
};

export type Debt = {
    id: string;
    userId: string;
    type: 'loan' | 'creditCard' | 'mortgage' | 'studentLoan';
    name: string;
    lender: string;
    balance: number;
    apr: number;
    minimumPayment: number;
    dueDate: string;
    strategyMeta?: string;
    updatedAt: string;
    createdAt: string;
};

export type Goal = {
    id: string;
    userId: string;
    goalType: string;
    targetAmount: number;
    targetDate: string;
    progressAmount: number;
    milestones?: string;
    updatedAt: string;
    createdAt: string;
};

export type Tip = {
    id: string;
    title: string;
    body: string;
    tags: string[];
    source: string;
    priority: number;
    publishedAt: string;
};
