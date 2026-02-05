import { SignupForm } from '@/components/auth/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signup - E-Pay Admin',
  description: 'Create an account for the E-Pay Admin Dashboard',
};

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <SignupForm />
    </main>
  );
}
