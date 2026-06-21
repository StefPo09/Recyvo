"use client";

import Image from "next/image";
import {useState, useEffect} from "react";
import logo from '../../Logo/Transparent/color.png';
import { FiUser, FiLock } from 'react-icons/fi';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';

function Input({ name, value, setValue, hasError, errorMessage }: { name: string, value: any, setValue: any, hasError: boolean, errorMessage?: string }){
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  function toggleVisibility(){
    setVisible(!visible);
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-5">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition duration-300 backdrop-blur-sm
        ${hasError 
          ? 'bg-red-50 border-red-400' 
          : focused 
          ? 'bg-(--color-bg-card) border-(--color-green-primary) shadow-md shadow-(--color-green-accent)' 
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
        <p className="mx-auto mt-2 max-w-sm text-sm text-red-500 font-(family-name:--font-body)">{errorMessage}</p>
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

      // navigate to home page after successful login
      try {
        router.push('../HomePage');
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
      <h1 className="mb-2 text-center text-[28px] font-bold leading-tight text-(--color-text-primary) font-(family-name:--font-logo)">
        Welcome Back
      </h1>
      <p className="mb-6 text-center text-sm text-(--color-text-secondary) font-(family-name:--font-body)">Log in to your account</p>

      <div className={`mb-3 px-4 py-3 rounded-lg text-center text-sm font-medium transition duration-300 ${
        error 
          ? 'bg-red-50 text-red-700 border border-red-300' 
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
      />
      <Input
        name="Password"
        value={password}
        setValue={setPassword}
        hasError={passwordError}
        errorMessage={password.length === 0 ? 'Password is required' : ''}
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
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-main) px-5 py-6 text-(--color-text-primary)">
      <section className="flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl bg-(--color-bg-card) shadow-lg">
        <div className="w-full rounded-b-3xl bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) px-6 pb-8 pt-8 text-center text-(--color-text-on-green) shadow-lg">
          <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full bg-(--color-text-on-green) shadow-lg">
            <Image
              src={logo}
              alt="Recyvo logo"
              height={118}
              width={118}
              priority
            />
          </div>

          <div className="mb-3 text-sm font-medium uppercase tracking-wider text-white/75 font-(family-name:--font-header)">
            Smart city sorting
          </div>
          <h1 className="text-[28px] font-bold leading-tight font-(family-name:--font-logo)">
            Welcome back.
          </h1>
          <p className="mt-2 text-[20px] font-medium text-white/85 font-(family-name:--font-header)">
            Scan. Sort. Share.
          </p>
        </div>

        <div className="w-full px-6 pb-7 pt-6">
          <div className="mb-5 rounded-xl border-l-4 border-(--color-green-primary) bg-(--color-bg-main) p-4">
            <p className="font-semibold text-(--color-text-primary) font-(family-name:--font-header)">
              Continue where you left off
            </p>
            <p className="mt-1 text-sm leading-6 text-(--color-text-secondary) font-(family-name:--font-body)">
              Log in to access the scanner, map, and your saved progress.
            </p>
          </div>

          <LogIn />

          <div className="mt-5 text-center text-sm text-(--color-text-secondary) font-(family-name:--font-body)">
            <p>
              Don&apos;t have an account?{" "}
              <a
                href="../SignUpPage"
                className="font-semibold text-(--color-green-primary) transition hover:opacity-90"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
