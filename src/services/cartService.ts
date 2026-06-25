// Phase 1 — all cart operations handled in Redux locally
// Phase 4 — synced with backend

export const getCart = async () => ({ data: { data: { cart: { items: [] }, total: 0 } } });
export const addToCart = async (data: any) => ({ data: { data: {} } });
export const updateCartItem = async (itemId: string, quantity: number) => ({ data: { data: {} } });
export const removeFromCart = async (itemId: string) => ({ data: { data: {} } });
export const clearCart = async () => ({ data: { data: {} } });
