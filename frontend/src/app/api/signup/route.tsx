"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

export default function SignupPage() {

  const router = useRouter();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:3000/api/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {

        alert(data.error);

      } else {

        alert("Signup successful");

        router.push("/login");
      }

    } catch (error) {

      alert("Something went wrong");

    } finally {

      setLoading(false);
    }
  };

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl w-full max-w-md">

        <h1 className="text-4xl font-bold mb-8 text-center">
          Create Account
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800 p-4 rounded-2xl outline-none"
          />

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
            onClick={handleSignup}
            className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-semibold"
          >
            {loading ? "Creating Account..." : "Signup"}
          </button>

        </div>

      </div>

    </main>
  );
}