import api from './api';

export const createOrder = async (data: any) => {
  // Map items to match backend OrderItemSchema expecting 'product' key
  const formattedItems = data.items.map((item: any) => ({
    product: item.product || item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    color: item.color,
    size: item.size
  }));

  const payload = {
    ...data,
    items: formattedItems
  };

  const res = await api.post('/orders', payload);
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          order: res.data.order,
          clientSecret: res.data.clientSecret || null
        }
      }
    };
  }
  return res;
};

export const getMyOrders = async () => {
  const res = await api.get('/orders/my-orders');
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          orders: res.data.orders,
          pagination: { totalOrders: res.data.orders.length }
        }
      }
    };
  }
  return res;
};

export const getOrderById = async (id: string) => {
  const res = await api.get(`/orders/${id}`);
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          order: res.data.order
        }
      }
    };
  }
  return res;
};

export const getOrders = async () => {
  const res = await api.get('/orders');
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          orders: res.data.orders
        }
      }
    };
  }
  return res;
};

export const updateOrderStatus = async (id: string, status: string, paymentStatus?: string) => {
  const res = await api.put(`/orders/${id}/status`, { status, paymentStatus });
  if (res.data.success) {
    return {
      data: {
        success: true,
        data: {
          order: res.data.order
        }
      }
    };
  }
  return res;
};

export const createPaymentIntent = async (amount: number) => {
  const res = await api.post('/orders/checkout-session', { amount });
  if (res.data.success) {
    return {
      data: {
        success: true,
        clientSecret: res.data.clientSecret,
        paymentIntentId: res.data.paymentIntentId
      }
    };
  }
  return res;
};

export const cancelOrder = async (id: string) => {
  const res = await api.put(`/orders/${id}/status`, { status: 'cancelled' });
  return res;
};

export const trackOrder = async (orderId: string, email: string) => {
  const res = await api.post('/orders/track', { orderId, email });
  return res;
};

