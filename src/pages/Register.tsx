import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register, loginWithGoogle } from "@/services/authService";
import { setCredentials } from "@/redux/slices/authSlice";
import { toast } from "sonner";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Dynamically load Google GSI library
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      const google = (window as any).google;
      if (google) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1025588301550-placeholder.apps.googleusercontent.com",
          callback: handleGoogleCallback,
        });

        google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: "100%", text: "signup_with" }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleCallback = async (response: any) => {
    try {
      const credential = response.credential;
      const base64Url = credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);
      const { email: gEmail, name: gName, sub: googleId, picture: avatar } = decoded;

      const res = await loginWithGoogle({
        email: gEmail,
        name: gName,
        googleId,
        avatar: avatar || "",
      });

      if (res.data.success) {
        dispatch(setCredentials(res.data.data));
        toast.success("Registered and signed in with Google successfully!");
        navigate("/account");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Google registration failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validations
    if (!name.trim()) {
      return toast.error("Full Name is required.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return toast.error("Please enter a valid email address.");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      const res = await register({ name: name.trim(), email: email.trim(), password });
      toast.success(res.data.message || "Registration successful! Please verify your email.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <PageShell>
      <Helmet><title>Register</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-secondary/30 p-8 rounded-sm border border-border">
          <h2 className="font-serif text-3xl text-primary text-center mb-6">Create Account</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <input 
              type="text" 
              required 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full border border-border bg-background p-3 rounded-sm outline-none focus:border-primary text-sm transition-all" 
            />
            <input 
              type="email" 
              required 
              placeholder="Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full border border-border bg-background p-3 rounded-sm outline-none focus:border-primary text-sm transition-all" 
            />
            <input 
              type="password" 
              required 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border border-border bg-background p-3 rounded-sm outline-none focus:border-primary text-sm transition-all" 
            />
            <input 
              type="password" 
              required 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="w-full border border-border bg-background p-3 rounded-sm outline-none focus:border-primary text-sm transition-all" 
            />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 transition-all font-semibold">Register</button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <span className="relative bg-background px-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">or sign up with</span>
          </div>

          <div className="flex justify-center">
            <div id="google-signup-btn" className="w-full min-h-[40px] flex justify-center"></div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline text-sm font-semibold">Sign In</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
