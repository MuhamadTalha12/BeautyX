import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  items: any[];
}

const savedWishlist = typeof window !== 'undefined' ? localStorage.getItem('beautyx_wishlist') : null;

const initialState: WishlistState = {
  items: savedWishlist ? JSON.parse(savedWishlist) : [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<any>) => {
      if (!state.items.find((item) => item._id === action.payload._id)) {
        state.items.push(action.payload);
        localStorage.setItem('beautyx_wishlist', JSON.stringify(state.items));
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      localStorage.setItem('beautyx_wishlist', JSON.stringify(state.items));
    },
    setWishlist: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
      localStorage.setItem('beautyx_wishlist', JSON.stringify(state.items));
    }
  },
});

export const { addToWishlist, removeFromWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
