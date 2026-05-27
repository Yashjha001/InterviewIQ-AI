"use client";

import { useState } from "react";

import { signIn } from "next-auth/react";

import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    setLoading(true);

    const result = await signIn(
      "credentials",
      {
        email,
        password,
        redirect: false,
      }
    );

    if (result?.error) {

      alert(result.error);

    } else {

      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl w-full max-w-md">

        <h1 className="text-4xl font-bold mb-8 text-center">
          Welcome Back
        </h1>

        <div className="space-y-5">

          <button
            onClick={() =>
              signIn("google", {
                callbackUrl: "/dashboard",
              })
            }
            className="w-full bg-white text-black hover:bg-zinc-200 p-4 rounded-2xl font-semibold"
          >
            Continue with Google
          </button>

          <button
            onClick={() =>
              signIn("github", {
                callbackUrl: "/dashboard",
              })
            }
            className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl font-semibold"
          >
            Continue with GitHub
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-500 text-sm uppercase tracking-[0.3em]">
              or
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 p-4 rounded-2xl outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 p-4 rounded-2xl outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-semibold"
          >
            {loading ? "Logging In..." : "Login"}
          </button>

        </div>

      </div>

    </main>
  );
}