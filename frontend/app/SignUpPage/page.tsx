"use client";

import Image from "next/image";
import { useState } from "react";

function SignUp({ user, setUser }: { user: any, setUser: any }) {
  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSignUp() {
    if (username.length === 0 || emailAddress.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      setError("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!emailAddress.includes('@')) {
      setError("Please enter a valid email!");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters!");
    }
    setUser ([
      ...user,
      {
        username,
        emailAddress,
        password,
        id: crypto.randomUUID()
      }]);
  }

  return (
    <>
      <h1 className="mt-4 mb-4 text-center text-[36px] leading-none tracking-normal text-[#1A2B23] dark:text-green-200">
        SIGN UP
      </h1>
      <p className="mb-4 text-center text-red-500">{error}</p>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-3 w-full text-center shadow appearance-none border border-gray-200 rounded-md"
      />
      <input
        placeholder="Email Address"
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
        className="mb-3 w-full text-center shadow appearance-none border border-gray-200 rounded-md"
      />
      <input
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-3 w-full text-center shadow appearance-none border border-gray-200 rounded-md"
      />
      <input
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="mb-3 w-full text-center shadow appearance-none border border-gray-200 rounded-md"
      />
      <button
        onClick={handleSignUp}
        className="mb-5 w-full text-center"
      >Create Account</button>
    </>
  )
}

export default function Home() {
  const [user, setUser] = useState([])
  return (
    <main className="min-h-screen bg-[#f8f9fA] px-5 py-6 sm:grid sm:place-items-center dark:bg-black">
      <Image
        src="" // Adauga file path-ul catre logo color
        alt="LOGO"
      />

      <h1 className="mb-4 text-center text-[36px] leading-none tracking-normal text-[#1A2B23] dark:text-green-200">
        SEB: Brașov Eco Assistant
      </h1>

      <div className={"w-md bg-[#FFFFFF] dark:bg-gray-950"}>
        <SignUp
          user={user}
          setUser={setUser}
        />
      </div>
    </main>
  );
}