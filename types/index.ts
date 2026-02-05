export interface LocalizedString {
  en: string;
  fr: string;
  ar: string;
  it: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Offer {
  id: string;
  name: LocalizedString;
  price: number;
}

export interface Product {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  category: string;
  imageUrl?: string;
  offers: Offer[];
  rating: number;
}

export interface Category {
  id: string;
  name: LocalizedString;
  icon: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method: string;
  date: string;
  proofUrl?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isEnabled: boolean;
}
