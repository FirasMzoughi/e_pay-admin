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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Product, Category, LocalizedString, Offer } from '@/types';
import { storageService } from '@/services/storageService';
import { productService } from '@/services/productService';
import { Loader2, Plus, Trash2, Image as ImageIcon, Tags } from 'lucide-react';

const INITIAL_LOCALIZED_STRING: LocalizedString = { en: '', fr: '', ar: '', it: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isOffersDialogOpen, setIsOffersDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product Form State
  const [name, setName] = useState<LocalizedString>(INITIAL_LOCALIZED_STRING);
  const [description, setDescription] = useState<LocalizedString>(INITIAL_LOCALIZED_STRING);
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // NEW: File state
  const [imageUrl, setImageUrl] = useState(''); // Keep this for preview or manual URL

  // Offer Form State
  const [offerName, setOfferName] = useState<LocalizedString>(INITIAL_LOCALIZED_STRING);
  const [offerPrice, setOfferPrice] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async () => {
    if (!name.en || !categoryId) return;
    setIsLoading(true);
    try {
      let finalImageUrl = imageUrl;

      // 1. Upload Image if selected
      if (imageFile) {
        try {
          finalImageUrl = await storageService.uploadImage(imageFile, 'images', 'products');
        } catch (uploadError) {
          console.error("Upload failed", uploadError);
          alert("Image upload failed, creating product without image.");
        }
      }

      const newProd = await productService.createProduct({
        name,
        description,
        category: categoryId,
        imageUrl: finalImageUrl || undefined,
        offers: [],
        rating: 5.0
      });
      setProducts([...products, newProd]);
      setIsAddDialogOpen(false);
      resetProductForm();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!selectedProduct || !offerName.en || !offerPrice) return;

    try {
      const newOffer = await productService.addOffer(selectedProduct.id, {
        name: offerName,
        price: parseFloat(offerPrice)
      });

      // Update state
      const updatedOffers = [...selectedProduct.offers, newOffer];
      const updatedProduct = { ...selectedProduct, offers: updatedOffers };

      setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      setSelectedProduct(updatedProduct);

      // Reset fields
      setOfferName(INITIAL_LOCALIZED_STRING);
      setOfferPrice('');
    } catch (error: any) {
      console.error("Failed to add offer", error);
      alert(`Failed to add offer: ${error.message || error.code || 'Unknown error'}`);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!selectedProduct) return;
    if (!confirm('Delete this offer?')) return;

    try {
      await productService.deleteOffer(offerId);

      const updatedOffers = selectedProduct.offers.filter(o => o.id !== offerId);
      const updatedProduct = { ...selectedProduct, offers: updatedOffers };
      setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      setSelectedProduct(updatedProduct);
    } catch (error) {
      console.error("Failed to delete offer", error);
      alert("Failed to delete offer");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const resetProductForm = () => {
    setName(INITIAL_LOCALIZED_STRING);
    setDescription(INITIAL_LOCALIZED_STRING);
    setImageUrl('');
    setImageFile(null); // Reset file
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  const openOffersDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsOffersDialogOpen(true);
    setOfferName(INITIAL_LOCALIZED_STRING);
    setOfferPrice('');
  };

  const handleLocalizedChange = (
    setter: React.Dispatch<React.SetStateAction<LocalizedString>>,
    lang: keyof LocalizedString,
    value: string
  ) => {
    setter(prev => ({ ...prev, [lang]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetProductForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name.en}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setImageFile(e.target.files[0]);
                          // Preview logic
                          setImageUrl(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                    {imageUrl && (
                      <div className="h-20 w-20 relative rounded-md overflow-hidden border">
                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Localized Fields */}
              <div className="space-y-2">
                <Label>Localized Details</Label>
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="en">EN 🇺🇸</TabsTrigger>
                    <TabsTrigger value="fr">FR 🇫🇷</TabsTrigger>
                    <TabsTrigger value="ar">AR 🇹🇳</TabsTrigger>
                    <TabsTrigger value="it">IT 🇮🇹</TabsTrigger>
                  </TabsList>
                  {(['en', 'fr', 'ar', 'it'] as const).map((lang) => (
                    <TabsContent key={lang} value={lang} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name ({lang.toUpperCase()})</Label>
                        <Input
                          placeholder="Product Name"
                          value={name[lang]}
                          onChange={(e) => handleLocalizedChange(setName, lang, e.target.value)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description ({lang.toUpperCase()})</Label>
                        <Input
                          placeholder="Product Description"
                          value={description[lang]}
                          onChange={(e) => handleLocalizedChange(setDescription, lang, e.target.value)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProduct}>Create Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Offers Dialog */}
        <Dialog open={isOffersDialogOpen} onOpenChange={setIsOffersDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Manage Offers: {selectedProduct?.name.en}</DialogTitle>
              <DialogDescription>Add pricing packages for this product.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Add Offer Form */}
              <div className="border p-4 rounded-lg bg-muted/20 space-y-4">
                <h4 className="font-semibold text-sm">Add New Offer</h4>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Price (TND)</Label>
                    <Input type="number" step="0.1" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="e.g. 4.5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Offer Name (Localized)</Label>
                  <Tabs defaultValue="en" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-8">
                      <TabsTrigger className="text-xs" value="en">EN</TabsTrigger>
                      <TabsTrigger className="text-xs" value="fr">FR</TabsTrigger>
                      <TabsTrigger className="text-xs" value="ar">AR</TabsTrigger>
                      <TabsTrigger className="text-xs" value="it">IT</TabsTrigger>
                    </TabsList>
                    {(['en', 'fr', 'ar', 'it'] as const).map((lang) => (
                      <TabsContent key={lang} value={lang}>
                        <Input
                          className="h-8 text-xs"
                          placeholder={`e.g. 100 Diamonds (${lang})`}
                          value={offerName[lang]}
                          onChange={(e) => handleLocalizedChange(setOfferName, lang, e.target.value)}
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
                <Button size="sm" onClick={handleCreateOffer} disabled={!offerPrice}>Add Offer</Button>
              </div>

              {/* Offers List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Active Offers ({selectedProduct?.offers.length})</h4>
                {selectedProduct?.offers.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No offers yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name (EN)</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProduct?.offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell>{offer.name.en}</TableCell>
                          <TableCell>{offer.price} TND</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDeleteOffer(offer.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && products.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Offers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.imageUrl ? (
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                          <img src={product.imageUrl} alt={product.name.en} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{product.name.en}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{product.description.en}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {categories.find(c => c.id === product.category)?.name.en || product.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{product.offers.length}</span>
                        <span className="text-xs text-muted-foreground">packages</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => openOffersDialog(product)}>
                        <Tags className="w-4 h-4 mr-2" />
                        Offers
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id)}>
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
