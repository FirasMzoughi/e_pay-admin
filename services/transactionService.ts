import { Transaction } from '@/types';

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', userId: '1', userName: 'John Doe', amount: 12.5, status: 'pending', method: 'D17', date: '2023-11-20T10:30:00', proofUrl: 'https://placehold.co/600x1200' },
  { id: 'tx_2', userId: '2', userName: 'Jane Smith', amount: 4.5, status: 'approved', method: 'Zitouna', date: '2023-11-19T14:20:00', proofUrl: 'https://placehold.co/600x1200' },
  { id: 'tx_3', userId: '4', userName: 'Alice J', amount: 3.2, status: 'rejected', method: 'D17', date: '2023-11-18T09:00:00', proofUrl: 'https://placehold.co/600x1200' },
  { id: 'tx_4', userId: '1', userName: 'John Doe', amount: 50.0, status: 'pending', method: 'Zitouna', date: '2023-11-20T11:45:00', proofUrl: 'https://placehold.co/600x1200' },
];

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [...MOCK_TRANSACTIONS];
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log(`Transaction ${id} updated to ${status}`);
  }
};
