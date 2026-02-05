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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

import { PaymentMethod } from '@/types';
import { paymentMethodService } from '@/services/paymentMethodService';
import { storageService } from '@/services/storageService';
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // NEW: File state
  const [imageUrl, setImageUrl] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await paymentMethodService.getPaymentMethods();
      setMethods(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!name) return;
    setIsLoading(true);
    try {
      let finalImageUrl = imageUrl;

      // 1. Upload Image logic
      if (imageFile) {
        try {
          finalImageUrl = await storageService.uploadImage(imageFile, 'images', 'payment_methods');
        } catch (uploadError) {
          console.error("Upload failed", uploadError);
          // Fail gracefully or alert
        }
      }

      const newMethod = await paymentMethodService.createPaymentMethod({
        name,
        description,
        imageUrl: finalImageUrl,
        isEnabled: true
      });
      setMethods([...methods, newMethod]);
      setIsDialogOpen(false);
      resetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment method?')) return;
    try {
      await paymentMethodService.deletePaymentMethod(id);
      setMethods(methods.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await paymentMethodService.togglePaymentMethod(id);
      setMethods(methods.map(m => m.id === id ? { ...m, isEnabled: !m.isEnabled } : m));
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Payment Methods</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Method Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. D17" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Subtitle for users" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Logo/Icon</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      setImageFile(e.target.files[0]);
                      setImageUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
                {imageUrl && (
                  <div className="h-16 w-16 relative rounded-md overflow-hidden border mt-2">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!name}>Add Method</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Active Methods</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && methods.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Method Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      {method.imageUrl ? (
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-50 border border-slate-100">
                          <img src={method.imageUrl} alt={method.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="text-slate-900">{method.name}</div>
                      <div className="text-xs text-slate-500">{method.description}</div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggle(method.id)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${method.isEnabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                      >
                        {method.isEnabled ? 'Active' : 'Disabled'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(method.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
