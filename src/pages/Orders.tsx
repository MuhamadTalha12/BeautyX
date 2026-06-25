import { Helmet } from "react-helmet-async";
import { PageShell } from "@/components/site/PageShell";
import { useEffect, useState } from "react";
import { getMyOrders } from "@/services/orderService";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data.data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <PageShell>
      <Helmet><title>My Orders</title></Helmet>
      <div className="mx-auto max-w-7xl px-4 py-12 flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-2 hidden md:block">
          <Link to="/profile" className="block py-2 text-muted-foreground hover:text-primary">My Info</Link>
          <Link to="/orders" className="block py-2 text-primary font-medium">Orders</Link>
          <Link to="/wishlist" className="block py-2 text-muted-foreground hover:text-primary">Wishlist</Link>
        </aside>
        
        <div className="flex-1">
          <h1 className="font-serif text-3xl text-primary mb-8">My Orders</h1>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 bg-secondary/30 border border-border">
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
              <Link to="/new-arrivals" className="bg-primary text-primary-foreground px-6 py-2 text-xs uppercase tracking-widest inline-block">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="border border-border rounded-sm overflow-hidden">
                  <div className="bg-secondary/50 p-4 border-b border-border flex justify-between items-center text-sm">
                    <div>
                      <p className="text-muted-foreground">Order ID: <span className="text-foreground font-medium">{order._id}</span></p>
                      <p className="text-muted-foreground text-xs mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs uppercase tracking-wider rounded-sm">{order.orderStatus}</span>
                      <p className="font-medium text-primary mt-2">PKR {order.total.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 py-2 border-b border-border last:border-0 last:pb-0">
                        <div className="w-16 h-20 bg-secondary/80 flex-shrink-0" />
                        <div>
                          <p className="font-serif text-primary">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-secondary/20 p-4 border-t border-border flex justify-end">
                    <Link to={`/order/${order._id}`} className="text-sm text-primary hover:underline">View Details →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
