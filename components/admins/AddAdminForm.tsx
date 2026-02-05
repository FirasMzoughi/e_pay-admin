'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createAdminUser } from '@/services/adminActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

const initialState = {
  error: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Admin User'}
    </Button>
  );
}

export function AddAdminForm() {
  const [state, formAction] = useFormState(createAdminUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <div className="max-w-md bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
      <p className="text-sm text-slate-500 mb-6">
        Create a new admin user. They will have access to the dashboard but cannot create other admins.
      </p>

      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" required placeholder="Jane Doe" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="admin@epay.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" />
        </div>

        {state?.error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
            {state.success}
          </div>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
