import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "@/services/authService";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyEmail(token || "");
        setStatus("success");
        setMessage(res.data.message);
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.response?.data?.message || "Verification failed. Invalid or expired token.");
      }
    };
    verify();
  }, [token]);

  return (
    <PageShell>
      <Helmet><title>Verify Email</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
        <div className="w-full max-w-md p-8">
          <h2 className="font-serif text-3xl text-primary mb-6">Email Verification</h2>
          
          {status === "loading" && <p className="text-muted-foreground">Verifying your email...</p>}
          
          {status === "success" && (
            <div>
              <p className="text-green-600 mb-6">{message}</p>
              <Link to="/login" className="inline-block bg-primary text-primary-foreground px-10 py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90">Continue to Login</Link>
            </div>
          )}
          
          {status === "error" && (
            <div>
              <p className="text-rose mb-6">{message}</p>
              <Link to="/" className="inline-block border border-primary text-primary px-10 py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-secondary">Go Home</Link>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
