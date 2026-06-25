import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/services/authService";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await forgotPassword(email);
      toast.success(res.data.message);
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Failed to process request");
    }
  };

  return (
    <PageShell>
      <Helmet><title>Forgot Password</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-secondary/30 p-8 rounded-sm border border-border">
          <h2 className="font-serif text-3xl text-primary text-center mb-6">Reset Password</h2>
          
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">If an account exists with {email}, we have sent a password reset link.</p>
              <Link to="/login" className="inline-block mt-4 text-primary hover:underline">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-6">Enter your email address and we'll send you a link to reset your password.</p>
              <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-border p-3 rounded-sm" />
              <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90">Send Reset Link</button>
            </form>
          )}
          
          {!isSubmitted && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">Cancel</Link>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
