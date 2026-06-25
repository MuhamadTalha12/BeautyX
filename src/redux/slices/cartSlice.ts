import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  _id: string;
  slug: string;
  name: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  image: string;
  color: string;
  size: string;
  quantity: number;
  stock?: number;
  sizeStock?: Record<string, number>;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const savedCart = typeof window !== 'undefined' ? localStorage.getItem('beautyx_cart') : null;

const initialState: CartState = {
  items: savedCart ? JSON.parse(savedCart) : [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) => item._id === action.payload._id && item.color === action.payload.color && item.size === action.payload.size
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.isOpen = true; // Open cart on add
      localStorage.setItem('beautyx_cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<{ _id: string; color: string; size: string }>) => {
      state.items = state.items.filter(
        (item) => !(item._id === action.payload._id && item.color === action.payload.color && item.size === action.payload.size)
      );
      localStorage.setItem('beautyx_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action: PayloadAction<{ _id: string; color: string; size: string; quantity: number }>) => {
      const item = state.items.find(
        (i) => i._id === action.payload._id && i.color === action.payload.color && i.size === action.payload.size
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
      localStorage.setItem('beautyx_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('beautyx_cart');
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      localStorage.setItem('beautyx_cart', JSON.stringify(state.items));
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartOpen, setCart } = cartSlice.actions;
export default cartSlice.reducer;
