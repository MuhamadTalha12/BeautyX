import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        dispatch(setCredentials({ user, accessToken: token }));
        navigate("/account");
      } catch (e) {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
