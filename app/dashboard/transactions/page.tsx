'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Transaction } from '@/types';
import { transactionService } from '@/services/transactionService';
import { Loader2, Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setIsLoading(true);
    try {
      await transactionService.updateStatus(id, status);
      // Optimistic update
      setTransactions(transactions.map(t => t.id === id ? { ...t, status } : t));
      if (selectedTx && selectedTx.id === id) {
        setSelectedTx({ ...selectedTx, status });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    filterStatus === 'all' || t.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize",
              filterStatus === status
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && transactions.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.userName || tx.userId}</TableCell>
                    <TableCell>{tx.amount} DT</TableCell>
                    <TableCell>{tx.method}</TableCell>
                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        tx.status === 'approved' ? "bg-green-100 text-green-800" :
                          tx.status === 'rejected' ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                      )}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedTx(tx)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verify Payment - {selectedTx?.method}</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-500">User</h4>
                <p className="text-lg">{selectedTx?.userName}</p>
                <p className="text-sm text-gray-400">ID: {selectedTx?.userId}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Amount</h4>
                <p className="text-2xl font-bold">{selectedTx?.amount} DT</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Transaction Date</h4>
                <p>{selectedTx ? new Date(selectedTx.date).toLocaleString() : ''}</p>
              </div>

              {selectedTx?.status === 'pending' && (
                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    className="bg-green-600 hover:bg-green-700 w-full"
                    onClick={() => selectedTx && handleStatusUpdate(selectedTx.id, 'approved')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve Payment
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => selectedTx && handleStatusUpdate(selectedTx.id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject Payment
                  </Button>
                </div>
              )}

              {selectedTx?.status !== 'pending' && (
                <div className={cn(
                  "p-4 rounded-lg text-center font-bold border",
                  selectedTx?.status === 'approved' ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                )}>
                  Transaction {selectedTx?.status.toUpperCase()}
                </div>
              )}
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden min-h-[300px]">
              {selectedTx?.proofUrl ? (
                <img
                  src={selectedTx.proofUrl}
                  alt="Proof"
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-gray-500">No proof image uploaded</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
