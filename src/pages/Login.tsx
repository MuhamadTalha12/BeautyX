import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import { login, loginWithGoogle } from "@/services/authService";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("test@beautyx.com");
  const [password, setPassword] = useState("Test1234");
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "100%", text: "signin_with" }
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
        toast.success("Signed in with Google successfully!");
        navigate("/account");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Google Sign-In failed");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return toast.error("Please enter a valid email address.");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    try {
      const res = await login({ email: email.trim(), password });
      dispatch(setCredentials(res.data.data));
      toast.success("Login successful!");
      navigate("/account");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <PageShell>
      <Helmet><title>Login</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-secondary/30 p-8 rounded-sm border border-border">
          <h2 className="font-serif text-3xl text-primary text-center mb-6">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot Password?</Link>
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90 transition-all font-semibold">Sign In</button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <span className="relative bg-background px-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">or login with</span>
          </div>

          <div className="flex justify-center">
            <div id="google-signin-btn" className="w-full min-h-[40px] flex justify-center"></div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-primary hover:underline text-sm font-semibold">Register</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
