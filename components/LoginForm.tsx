"use client";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get the ID token result to check admin status
      const idTokenResult = await userCredential.user.getIdTokenResult();

      toast({
        title: "Success",
        description: "Logged in successfully",
        className: "bg-green-500 text-white",
      });

      // Redirect based on admin status
      if (idTokenResult.claims.admin) {
        router.push("/admin");
      } else {
        router.push("/guest-dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto p-6 space-y-6'>
      <h2 className='text-2xl font-bold text-[#2B4C7E] text-center'>Login</h2>
      <form onSubmit={handleLogin} className='space-y-4'>
        <div>
          <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
            Email
          </label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'
            required
          />
        </div>
        <div>
          <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
            Password
          </label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'
            required
          />
        </div>
        <button
          type='submit'
          disabled={isLoggingIn}
          className='w-full p-4 bg-[#2B4C7E] text-white rounded-2xl hover:bg-[#2B4C7E]/90 disabled:opacity-50 transition duration-200'>
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
