import { Helmet } from "react-helmet-async";
import { PageShell } from "@/components/site/PageShell";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { Link, useNavigate } from "react-router-dom";
import { clearCredentials } from "@/redux/slices/authSlice";

export default function Profile() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
  };

  if (!user) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <p>Please login to view your profile.</p>
          <Link to="/login" className="text-primary hover:underline mt-4 inline-block">Login</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Helmet><title>My Profile</title></Helmet>
      <div className="mx-auto max-w-7xl px-4 py-12 flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-2">
          <div className="mb-8">
            <div className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-serif mb-4">
              {user.name.charAt(0)}
            </div>
            <h2 className="font-serif text-xl">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Link to="/profile" className="block py-2 text-primary font-medium">My Info</Link>
          <Link to="/orders" className="block py-2 text-muted-foreground hover:text-primary">Orders</Link>
          <Link to="/wishlist" className="block py-2 text-muted-foreground hover:text-primary">Wishlist</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="block py-2 text-rose hover:text-rose/80 font-semibold uppercase tracking-wider text-xs">Admin Dashboard</Link>
          )}
          <button onClick={handleLogout} className="block w-full text-left py-2 text-muted-foreground hover:text-rose">Logout</button>
        </aside>
        
        <div className="flex-1">
          <h1 className="font-serif text-3xl text-primary mb-8">My Info</h1>
          <div className="bg-secondary/30 p-8 rounded-sm border border-border">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Name</label>
                <input type="text" readOnly value={user.name} className="w-full border border-border p-3 rounded-sm bg-background" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Email</label>
                <input type="email" readOnly value={user.email} className="w-full border border-border p-3 rounded-sm bg-background" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Phone</label>
                <input type="tel" readOnly value={user.phone || ""} className="w-full border border-border p-3 rounded-sm bg-background" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
