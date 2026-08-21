'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface CartProduct {
    id: string;
    name: string;
    price: number;
    image_url?: string | null;
    stock: number;
    min_stock?: number;
    category?: string | null;
    description?: string | null;
}

export interface CartItem {
    product: CartProduct;
    quantity: number;
    storeSlug: string;
    storeName?: string;
}

interface CartContextType {
    items: CartItem[];
    currentStoreSlug: string | null;
    currentStoreName: string | null;
    cartTotal: number;
    totalItemsCount: number;
    buyerNotes: string;
    user: User | null;
    setBuyerNotes: (notes: string) => void;
    addItem: (product: CartProduct, storeSlug: string, storeName?: string) => Promise<boolean>;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'lora_global_cart';

export function CartProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: User | null }) {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [currentStoreSlug, setCurrentStoreSlug] = useState<string | null>(null);
    const [currentStoreName, setCurrentStoreName] = useState<string | null>(null);
    const [buyerNotes, setBuyerNotes] = useState<string>('');
    const [user, setUser] = useState<User | null>(initialUser ?? null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Sync initialUser when provided by server components
    useEffect(() => {
        if (initialUser !== undefined) {
            setUser(initialUser);
        }
    }, [initialUser]);

    // Load cart from LocalStorage on initial client render
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && Array.isArray(parsed.items)) {
                    setItems(parsed.items);
                    setCurrentStoreSlug(parsed.currentStoreSlug || null);
                    setCurrentStoreName(parsed.currentStoreName || null);
                    setBuyerNotes(parsed.buyerNotes || '');
                }
            }
        } catch (e) {
            console.error('Gagal membaca keranjang global dari LocalStorage:', e);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Save cart to LocalStorage whenever state updates
    useEffect(() => {
        if (!isInitialized) return;
        try {
            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify({
                    items,
                    currentStoreSlug,
                    currentStoreName,
                    buyerNotes,
                })
            );
        } catch (e) {
            console.error('Gagal menyimpan keranjang global ke LocalStorage:', e);
        }
    }, [items, currentStoreSlug, currentStoreName, buyerNotes, isInitialized]);

    // Track user authentication status and auto-clear cart on SIGNED_OUT or session expiration
    useEffect(() => {
        // Ambil status user awal saat komponen pertama kali dipasang
        supabase.auth.getUser().then(({ data }) => {
            const activeUser = data.user ?? null;
            setUser(activeUser);
            if (!activeUser) {
                clearCart();
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (event === 'SIGNED_OUT' || !currentUser) {
                clearCart();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Add item to cart with user authentication check and SweetAlert2 store change protection
    const addItem = async (product: CartProduct, storeSlug: string, storeName?: string): Promise<boolean> => {
        // Step 1: Pengecekan autentikasi pengguna. Jika user belum login (user === null), cegah penambahan produk.
        let currentUser = user;
        if (!currentUser) {
            const { data: { user: freshlyFetchedUser } } = await supabase.auth.getUser();
            currentUser = freshlyFetchedUser;
            if (currentUser) {
                setUser(currentUser);
            }
        }

        if (!currentUser) {
            const result = await Swal.fire({
                title: 'Login Diperlukan',
                text: 'Silakan masuk ke akun Anda untuk mulai berbelanja.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#D97706', // Warna khas LORA (Terracotta Warm)
                cancelButtonColor: '#64748B', // Slate 500
                confirmButtonText: 'Menuju Halaman Login',
                cancelButtonText: 'Batal',
                customClass: {
                    popup: 'rounded-3xl font-sans',
                    confirmButton: 'rounded-xl text-xs font-bold px-4 py-2.5',
                    cancelButton: 'rounded-xl text-xs font-bold px-4 py-2.5',
                },
            });

            if (result.isConfirmed) {
                router.push('/login');
            }

            return false;
        }

        if (product.stock <= 0) {
            toast.error('⚠️ Stok produk ini sudah habis');
            return false;
        }

        // Protection check: if cart already has items from another store
        if (currentStoreSlug && currentStoreSlug !== storeSlug && items.length > 0) {
            const result = await Swal.fire({
                title: 'Ganti Toko?',
                text: `Keranjang Anda saat ini berisi produk dari toko "${currentStoreName || currentStoreSlug}". Mengganti toko akan mengosongkan keranjang sebelumnya.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#D97706', // Terracotta warm LORA
                cancelButtonColor: '#64748B', // Slate 500
                confirmButtonText: 'Ya, Ganti Toko',
                cancelButtonText: 'Batal',
                customClass: {
                    popup: 'rounded-3xl font-sans',
                    confirmButton: 'rounded-xl text-xs font-bold px-4 py-2.5',
                    cancelButton: 'rounded-xl text-xs font-bold px-4 py-2.5',
                },
            });

            if (!result.isConfirmed) {
                return false;
            }

            // Clear old cart and add new item
            const newItem: CartItem = {
                product,
                quantity: 1,
                storeSlug,
                storeName,
            };
            setItems([newItem]);
            setCurrentStoreSlug(storeSlug);
            setCurrentStoreName(storeName || storeSlug);
            toast.success(`Produk ditambahkan! Keranjang diganti ke toko "${storeName || storeSlug}"`);
            return true;
        }

        // Same store or empty cart
        const existingItem = items.find((i) => i.product.id === product.id);

        if (existingItem) {
            if (existingItem.quantity + 1 > product.stock) {
                toast.error(`Kuantitas melebihi stok yang tersedia (${product.stock} pcs)`);
                return false;
            }
        }

        setCurrentStoreSlug(storeSlug);
        if (storeName) setCurrentStoreName(storeName);

        setItems((prevItems) => {
            const existingIndex = prevItems.findIndex((i) => i.product.id === product.id);
            if (existingIndex > -1) {
                return prevItems.map((item, index) =>
                    index === existingIndex
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { product, quantity: 1, storeSlug, storeName }];
        });

        toast.success(`"${product.name}" berhasil ditambahkan ke keranjang!`);
        return true;
    };

    const removeItem = (productId: string) => {
        const itemToRemove = items.find((i) => i.product.id === productId);
        const updated = items.filter((i) => i.product.id !== productId);

        setItems(updated);

        if (updated.length === 0) {
            setCurrentStoreSlug(null);
            setCurrentStoreName(null);
        }

        if (itemToRemove) {
            toast.success(`"${itemToRemove.product.name}" dihapus dari keranjang`);
        }
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }

        const targetItem = items.find((i) => i.product.id === productId);
        if (targetItem && quantity > targetItem.product.stock) {
            toast.error(`Stok maksimal hanya ${targetItem.product.stock} pcs`);
            return;
        }

        setItems((prevItems) =>
            prevItems.map((i) => {
                if (i.product.id === productId) {
                    return { ...i, quantity };
                }
                return i;
            })
        );
    };

    const clearCart = () => {
        setItems([]);
        setCurrentStoreSlug(null);
        setCurrentStoreName(null);
        setBuyerNotes('');
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (e) {
            console.error('Gagal mengosongkan keranjang di LocalStorage:', e);
        }
    };

    const cartTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                currentStoreSlug,
                currentStoreName,
                cartTotal,
                totalItemsCount,
                buyerNotes,
                user,
                setBuyerNotes,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart harus digunakan di dalam CartProvider');
    }
    return context;
}

