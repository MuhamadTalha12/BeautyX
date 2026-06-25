import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "@/services/authService";
import { toast } from "sonner";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      const res = await resetPassword(token || "", password);
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error("Failed to reset password. The link might be expired.");
    }
  };

  return (
    <PageShell>
      <Helmet><title>Create New Password</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-secondary/30 p-8 rounded-sm border border-border">
          <h2 className="font-serif text-3xl text-primary text-center mb-6">New Password</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" required placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-border p-3 rounded-sm" />
            <input type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-border p-3 rounded-sm" />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90">Update Password</button>
          </form>
          
        </div>
      </div>
    </PageShell>
  );
}
