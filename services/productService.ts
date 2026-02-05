import { Category, Product, Offer, LocalizedString } from '@/types';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// --- Helpers to map between DB (flat) and Frontend (nested) ---

// Categories
const mapCategoryFromDB = (row: any): Category => ({
  id: row.id,
  name: {
    en: row.name_en || '',
    fr: row.name_fr || '',
    ar: row.name_ar || '',
    it: row.name_it || ''
  },
  icon: row.icon || '📦'
});

// Products
const mapProductFromDB = (row: any): Product => ({
  id: row.id,
  category: row.category_id, // Frontend uses 'category' as ID string based on previous mock
  name: {
    en: row.name_en || '',
    fr: row.name_fr || '',
    ar: row.name_ar || '',
    it: row.name_it || ''
  },
  description: {
    en: row.description_en || '',
    fr: row.description_fr || '',
    ar: row.description_ar || '',
    it: row.description_it || ''
  },
  imageUrl: row.image_url,
  rating: Number(row.rating) || 5.0,
  offers: row.product_offers ? row.product_offers.map(mapOfferFromDB) : []
});

// Offers
const mapOfferFromDB = (row: any): Offer => ({
  id: row.id,
  name: {
    en: row.name_en || '',
    fr: row.name_fr || '',
    ar: row.name_ar || '',
    it: row.name_it || ''
  },
  price: Number(row.price)
});


export const productService = {
  // --- Categories ---
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await (supabase
      .from('categories') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapCategoryFromDB);
  },

  createCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const { data, error } = await (supabase
      .from('categories') as any)
      .insert({
        name_en: category.name.en,
        name_fr: category.name.fr,
        name_ar: category.name.ar,
        name_it: category.name.it,
        icon: category.icon
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapCategoryFromDB(data);
  },

  deleteCategory: async (id: string) => {
    const { error } = await (supabase.from('categories') as any).delete().eq('id', id);
    if (error) throw error;
  },

  // ...

  // --- Products ---
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await (supabase
      .from('products') as any)
      .select('*, product_offers(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapProductFromDB);
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    // 1. Create Product
    const { data: prodData, error: prodError } = await (supabase
      .from('products') as any)
      .insert({
        category_id: product.category,
        name_en: product.name.en,
        name_fr: product.name.fr,
        name_ar: product.name.ar,
        name_it: product.name.it,
        description_en: product.description.en,
        description_fr: product.description.fr,
        description_ar: product.description.ar,
        description_it: product.description.it,
        image_url: product.imageUrl,
        rating: product.rating
      } as any)
      .select()
      .single();

    if (prodError) throw prodError;

    // 2. Create Offers if any (though usually empty on creation based on UI)
    if (product.offers.length > 0) {
      const offersToInsert = product.offers.map(o => ({
        product_id: (prodData as any).id,
        name_en: o.name.en,
        name_fr: o.name.fr,
        name_ar: o.name.ar,
        name_it: o.name.it,
        price: o.price
      }));

      const { error: offersError } = await (supabase
        .from('product_offers') as any)
        .insert(offersToInsert as any);

      if (offersError) throw offersError;
    }

    // Return full object with empty offers array for now if created without them
    // or we could refetch. For now, returning constructed object is faster.
    return {
      ...mapProductFromDB(prodData),
      offers: product.offers as Offer[] // Assuming IDs are missing in input but that's handled in UI flow usually by separate calls or ignore
    };
  },

  updateProduct: async (id: string, product: Partial<Omit<Product, 'id' | 'offers'>>): Promise<Product> => {
    const updates: any = {};
    if (product.category) updates.category_id = product.category;
    if (product.name) {
      updates.name_en = product.name.en;
      updates.name_fr = product.name.fr;
      updates.name_ar = product.name.ar;
      updates.name_it = product.name.it;
    }
    if (product.description) {
      updates.description_en = product.description.en;
      updates.description_fr = product.description.fr;
      updates.description_ar = product.description.ar;
      updates.description_it = product.description.it;
    }
    if (product.imageUrl !== undefined) updates.image_url = product.imageUrl;
    if (product.rating !== undefined) updates.rating = product.rating;

    const { data, error } = await (supabase
      .from('products') as any)
      .update(updates)
      .eq('id', id)
      .select('*, product_offers(*)')
      .single();

    if (error) throw error;
    return mapProductFromDB(data);
  },

  deleteProduct: async (id: string) => {
    const { error } = await (supabase.from('products') as any).delete().eq('id', id);
    if (error) throw error;
  },

  // ...

  addOffer: async (productId: string, offer: Omit<Offer, 'id'>): Promise<Offer> => {
    const { data, error } = await (supabase
      .from('product_offers') as any)
      .insert({
        product_id: productId,
        name_en: offer.name.en,
        name_fr: offer.name.fr,
        name_ar: offer.name.ar,
        name_it: offer.name.it,
        price: offer.price
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapOfferFromDB(data);
  },

  deleteOffer: async (offerId: string): Promise<void> => {
    const { error } = await (supabase.from('product_offers') as any).delete().eq('id', offerId);
    if (error) throw error;
  }
};
