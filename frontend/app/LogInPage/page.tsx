"use client";

import Image from "next/image";
import {useState, useEffect} from "react";
import logo from '../../Logo/Transparent/color.png';
import { FiUser, FiLock } from 'react-icons/fi';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import { loginUser } from '../../lib/api';

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
          ? 'bg-red-50 dark:bg-red-950/20 border-red-400 dark:border-red-600' 
          : focused 
          ? 'bg-white dark:bg-gray-900 border-emerald-500 dark:border-emerald-400 shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/50' 
          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {name === 'Username or Email' ? (
          <FiUser className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
          }`} size={20} />
        ) : (
          <FiLock className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
          }`} size={20} />
        )}

        <input
          type={name === 'Password' ? visible ? 'text' : 'password' : 'text'}
          placeholder={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base font-medium"
        />

        {name === 'Password' ? (
          <button
            type="button"
            onClick={toggleVisibility}
            className={`shrink-0 transition duration-300 focus:outline-none ${
              hasError ? 'text-red-500' : focused ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
            } hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer`}
          >
            {visible ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
          </button>
        ) : null}
      </div>
      {errorMessage ? (
        <p className="mt-2 text-sm text-red-500 max-w-sm mx-auto">{errorMessage}</p>
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
      <h1 className="mt-6 mb-2 text-center text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Welcome Back
      </h1>
      <p className="mb-8 text-center text-gray-600 dark:text-gray-400 text-sm">Log in to your account</p>

      <div className={`mb-3 px-4 py-3 rounded-lg text-center text-sm font-medium transition duration-300 ${
        error 
          ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800' 
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
             className={`mt-8 mb-4 mx-auto max-w-sm w-full px-4 py-3 ${isFormValid && !isLoading ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 cursor-pointer' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'} text-white font-semibold rounded-lg transition duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95 transform`}
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
    <main className="min-h-screen bg-[#2D8A56] dark:bg-[#1A2B23] px-4 py-8 sm:py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block">
            <Image
              src={logo}
              alt="LOGO"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest">Log In</h2>
          </div>

          <div className="px-6 py-8">
            <LogIn />
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-600 dark:text-gray-400">
            <p>Don't have an account? <a href="../SignUpPage" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold transition">Sign up</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}