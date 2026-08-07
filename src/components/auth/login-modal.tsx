import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";
import { getRedirectResult, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/site";

export function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, loginSuccess } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"form" | "otp">("form");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  /** Exchanges a Firebase user for our own token; shared by popup and redirect. */
  const exchangeFirebaseUser = async (user: { getIdToken: () => Promise<string> }) => {
    const firebaseIdToken = await user.getIdToken();
    const res = await fetch(`${API_BASE_URL}/auth/firebase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: firebaseIdToken }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Backend login failed");
    }
    const data = await res.json();
    loginSuccess(data.user, data.access_token);
    toast.success(`Welcome, ${data.user.name}!`);
    handleClose(false);
  };

  // Finish a redirect sign-in that started before this page load.
  useEffect(() => {
    getRedirectResult(getFirebaseAuth())
      .then((result) => {
        if (result?.user) return exchangeFirebaseUser(result.user);
        return undefined;
      })
      .catch((err: Error) => toast.error(err.message || "Google sign-in failed."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStep("form");
    setOtpCode("");
  };

  const handleClose = (open: boolean) => {
    setLoginModalOpen(open);
    if (!open) {
      // Reset after animation finishes
      setTimeout(() => {
        setStep("form");
        setOtpCode("");
      }, 300);
    }
  };

  // ── Google Sign-In via Firebase ────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const auth = getFirebaseAuth();
      const provider = getGoogleProvider();
      // In-app browsers and strict popup blockers reject the popup outright;
      // a full-page redirect is the only flow that still completes there.
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: unknown) {
        const code = (popupError as { code?: string }).code ?? "";
        if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupError;
      }

      await exchangeFirebaseUser(result.user);
    } catch (error: unknown) {
      const err = error as Error;
      if (
        err.message?.includes("popup-closed-by-user") ||
        err.message?.includes("cancelled-popup-request")
      ) {
        return;
      }
      toast.error(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: Email / Password Submit or Request OTP ────────────────────
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Sign In
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Invalid email or password");
        }

        const data = await res.json();
        loginSuccess(data.user, data.access_token);
        toast.success(`Welcome back, ${data.user.name}!`);
        handleClose(false);
      } else {
        // Sign Up -> Step 1: Send OTP verification code
        const otpRes = await fetch(`${API_BASE_URL}/auth/otp/request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!otpRes.ok) {
          const err = await otpRes.json().catch(() => ({}));
          throw new Error(err.detail || "Could not send verification email");
        }

        toast.success("Verification code sent to your email! Check your inbox.");
        setStep("otp");
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & Complete Registration ────────────────────────
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setLoading(true);
    try {
      // 1. Verify the OTP code to get the signup token
      const verifyRes = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid verification code");
      }

      const verifyData = await verifyRes.json();
      const signupToken = verifyData.signup_token;

      // 2. Register the user with name, phone, and password
      const regRes = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signup_token: signupToken,
          name: name.trim() || email.split("@")[0],
          phone: phone.trim() || "0000000000",
          password,
        }),
      });

      if (!regRes.ok) {
        const err = await regRes.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to complete account creation");
      }

      const regData = await regRes.json();
      loginSuccess(regData.user, regData.access_token);
      toast.success(`Welcome to Royal Wool, ${regData.user.name}!`);
      handleClose(false);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Could not verify code or register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-hidden bg-background/80 backdrop-blur-xl border-border/40 shadow-2xl p-0 gap-0 rounded-2xl">
        <div className="sr-only">
          <DialogTitle>
            {step === "otp" ? "Verify Your Email" : isLogin ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription>Authenticate to access Royal Wool.</DialogDescription>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === "otp" ? (
              /* ── OTP Verification Screen ── */
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back to Details
                </button>

                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-4 text-foreground">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-2xl font-light text-foreground mb-2">
                    Verify Your Email
                  </h2>
                  <p className="font-data text-xs text-muted-foreground max-w-[260px]">
                    We sent a 6-digit verification code to <strong className="text-foreground">{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      className="text-center text-2xl tracking-widest font-mono h-12 bg-background/50 focus:bg-background transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="sheen relative w-full h-11 flex items-center justify-center rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all disabled:opacity-50 mt-4"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Verify & Create Account"
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* ── Main Login / Signup Form ── */
              <motion.div
                key="form-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center justify-center text-center mb-8">
                  <h2 className="font-display text-3xl font-light text-foreground mb-2">
                    {isLogin ? "Welcome Back" : "Join the Club"}
                  </h2>
                  <p className="font-data text-xs text-muted-foreground">
                    {isLogin
                      ? "Enter your details to access your account."
                      : "Create an account to experience ultra premium yarns."}
                  </p>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-3.5">
                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Arnab Senapati"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={!isLogin}
                          className="bg-background/50 focus:bg-background transition-colors"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 focus:bg-background transition-colors"
                    />
                  </div>

                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="phone">Mobile Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 85378 61040"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required={!isLogin}
                          className="bg-background/50 focus:bg-background transition-colors"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50 focus:bg-background transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="sheen relative w-full h-11 flex items-center justify-center rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all disabled:opacity-50 mt-6"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 font-data text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-11 flex items-center justify-center gap-2.5 rounded-full border border-border/60 bg-background/60 hover:bg-background transition-colors text-sm font-medium shadow-sm hover:shadow"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <p className="mt-7 text-center text-xs text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-foreground hover:underline font-medium underline-offset-4"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
