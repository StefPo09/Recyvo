"use client";

import {useState, useEffect} from "react";
import { FiUser, FiLock } from 'react-icons/fi';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { loginUser } from '@/lib/api';
import { useSettings } from "@/lib/SettingsContext";
import AuthShell from "@/components/AuthShell";

function Input({ name, value, setValue, hasError, errorMessage, isDark }: { name: string, value: any, setValue: any, hasError: boolean, errorMessage?: string; isDark: boolean }){
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  function toggleVisibility(){
    setVisible(!visible);
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-5">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition duration-300 backdrop-blur-sm
        ${hasError 
          ? isDark
            ? 'bg-red-950/40 border-red-800'
            : 'bg-red-50 border-red-400'
          : focused 
          ? 'bg-(--color-bg-card) border-(--color-green-primary) shadow-(--color-green-accent)' 
          : 'bg-(--color-bg-card) border-(--color-green-accent)'}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {name === 'Username or Email' ? (
          <FiUser className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-(--color-green-primary)' : 'text-(--color-text-secondary)'
          }`} size={20} />
        ) : (
          <FiLock className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-(--color-green-primary)' : 'text-(--color-text-secondary)'
          }`} size={20} />
        )}

        <input
          type={name === 'Password' ? visible ? 'text' : 'password' : 'text'}
          placeholder={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent text-base font-medium text-(--color-text-primary) placeholder-(--color-text-secondary) outline-none font-(family-name:--font-body)"
        />

        {name === 'Password' ? (
          <button
            type="button"
            onClick={toggleVisibility}
            className={`shrink-0 transition duration-300 focus:outline-none ${
              hasError ? 'text-red-500' : focused ? 'text-(--color-green-primary)' : 'text-(--color-text-secondary)'
            } cursor-pointer hover:text-(--color-green-primary)`}
          >
            {visible ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
          </button>
        ) : null}
      </div>
      {errorMessage ? (
        <p className={`mx-auto mt-2 max-w-sm text-sm font-(family-name:--font-body) ${isDark ? 'text-red-300' : 'text-red-500'}`}>{errorMessage}</p>
      ) : null}
    </div>
  )
}

function LogIn() {
  const [usernameEmail, setUsernameEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [usernameEmailError, setUsernameEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "Dark";

  // Live validation: update error flags as the user types
  useEffect(() => {
    const usernameEmailEmpty = usernameEmail.length === 0;
    setUsernameEmailError(usernameEmailEmpty);

    const passwordEmpty = password.length === 0;
    setPasswordError(passwordEmpty);

    if (!usernameEmailEmpty && !passwordEmpty) {
      setError('');
    }
  }, [usernameEmail, password]);

  async function handleSubmit() {
    // Final validation before submit
    const isFormValid = usernameEmail.length > 0 && password.length > 0;
    if (!isFormValid) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({
        username_or_email: usernameEmail,
        parola: password,
      });

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('userId', response.id);
      window.dispatchEvent(new Event("recyvo-auth-changed"));

      // navigate to home page after successful login
      try {
        router.push('/HomePage');
      } catch (e) {
        // ignore navigation errors during dev
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className={`mb-3 px-4 py-3 rounded-lg text-center text-sm font-medium transition duration-300 ${
        error 
          ? isDark
            ? 'bg-red-950/40 text-red-200 border border-red-800'
            : 'bg-red-50 text-red-700 border border-red-300'
          : 'hidden'
      }`}>
        {error}
      </div>

      <Input
        name="Username or Email"
        value={usernameEmail}
        setValue={setUsernameEmail}
        hasError={usernameEmailError}
        errorMessage={usernameEmail.length === 0 ? 'Username or email is required' : ''}
        isDark={isDark}
      />
      <Input
        name="Password"
        value={password}
        setValue={setPassword}
        hasError={passwordError}
        errorMessage={password.length === 0 ? 'Password is required' : ''}
        isDark={isDark}
      />

       {(() => {
         const isFormValid = usernameEmail.length > 0 && password.length > 0;
         return (
           <button
             type="button"
             onClick={handleSubmit}
             disabled={!isFormValid || isLoading}
             className={`mt-8 mb-4 mx-auto flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-lg text-base font-bold text-(--color-text-on-green) shadow-lg transition font-(family-name:--font-header) ${isFormValid && !isLoading ? 'cursor-pointer bg-(--color-green-primary) hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-(--color-green-primary)/30' : 'cursor-not-allowed bg-(--color-text-secondary) opacity-60'}`}
           >
             {isLoading ? (
               <>
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 Logging In...
               </>
             ) : (
               <>
                 <FiUser size={20} />
                 Log In
               </>
             )}
           </button>
         );
       })()}
    </>
  )
}

export default function Home() {
  return (
    <AuthShell
      title="Welcome back."
      subtitle="Scan. Sort. Share."
      introTitle="Continue where you left off"
      introBody="Log in to access the scanner, map, and your saved progress."
      footer={
        <div className="text-center text-sm text-(--color-text-secondary) font-(family-name:--font-body)">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/SignUpPage"
              className="font-semibold text-(--color-green-primary) transition hover:opacity-90"
            >
              Sign up
            </Link>
          </p>
        </div>
      }
    >
      <LogIn />
    </AuthShell>
  );
}
