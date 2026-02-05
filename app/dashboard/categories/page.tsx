'use client';

import { useEffect, useState } from 'react';
import {
  Card, CardContent
} from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Category, LocalizedString } from '@/types';
import { productService } from '@/services/productService';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const INITIAL_LOCALIZED_STRING: LocalizedString = { en: '', fr: '', ar: '', it: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Localized State
  const [newCategoryName, setNewCategoryName] = useState<LocalizedString>(INITIAL_LOCALIZED_STRING);
  const [newCategoryIcon, setNewCategoryIcon] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategoryName.en) return; // Basic validation
    setIsLoading(true);
    try {
      const newCat = await productService.createCategory({
        name: newCategoryName,
        icon: newCategoryIcon || '📦'
      });
      setCategories([...categories, newCat]);
      setIsDialogOpen(false);
      setNewCategoryName(INITIAL_LOCALIZED_STRING);
      setNewCategoryIcon('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await productService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNameChange = (lang: keyof LocalizedString, value: string) => {
    setNewCategoryName(prev => ({ ...prev, [lang]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Details</Label>
                <div className="grid gap-2">
                  <Label htmlFor="icon" className="text-xs text-muted-foreground">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    placeholder="e.g. 🎮"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name (Localized)</Label>
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="en">EN 🇺🇸</TabsTrigger>
                    <TabsTrigger value="fr">FR 🇫🇷</TabsTrigger>
                    <TabsTrigger value="ar">AR 🇹🇳</TabsTrigger>
                    <TabsTrigger value="it">IT 🇮🇹</TabsTrigger>
                  </TabsList>
                  {(['en', 'fr', 'ar', 'it'] as const).map((lang) => (
                    <TabsContent key={lang} value={lang}>
                      <Input
                        placeholder={`Name in ${lang.toUpperCase()}`}
                        value={newCategoryName[lang]}
                        onChange={(e) => handleNameChange(lang, e.target.value)}
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!newCategoryName.en}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && categories.length === 0 ? (
          <div className="col-span-full flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="relative overflow-hidden hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="text-4xl bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  {category.icon}
                </div>
                <div className="flex-1">
                  {/* Display user's preferred language or falling back to EN */}
                  <h3 className="font-bold text-lg">{category.name.en}</h3>
                  <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                    <span title="French">{category.name.fr}</span> •
                    <span title="Arabic">{category.name.ar}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">ID: {category.id}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
