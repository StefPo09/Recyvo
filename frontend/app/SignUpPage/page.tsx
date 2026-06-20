"use client";

import Image from "next/image";
import {useState, useEffect} from "react";
import logo from '../../Logo/Transparent/color.png';
import { FiUser, FiMail, FiUserPlus, FiLock } from 'react-icons/fi';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import { signupUser } from '@/lib/api';

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
        {name === 'Username' ? (
          <FiUser className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
          }`} size={20} />
        ) : name === 'Email Address' ? (
          <FiMail className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
          }`} size={20} />
        ) : name === 'Full Name' ? (
          <FiUser className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
          }`} size={20} />
        ) : (
          <FiLock className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
          }`} size={20} />
        )}

        <input
          type={name === 'Password' || name === 'Confirm Password' ? visible ? 'text' : 'password' : 'text'}
          placeholder={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base font-medium"
        />

        {name === 'Password' || name === 'Confirm Password' ? (
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

function SignUp({ user, setUser }: { user: any, setUser: any }) {
  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [emailAddressError, setEmailAddressError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [lowercaseError, setLowercaseError] = useState(false);
  const [uppercaseError, setUppercaseError] = useState(false);
  const [numberError, setNumberError] = useState(false);
  const [specialCharacterError, setSpecialCharacterError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Derived checks (live)
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!?&#@$*]/.test(password);

  // Live validation: update error flags as the user types
  useEffect(() => {
    const usernameEmpty = username.length === 0;
    const usernameHasAt = username.includes('@');
    setUsernameError(usernameEmpty || usernameHasAt);

    const emailEmpty = emailAddress.length === 0;
    const emailInvalid = !emailAddress.includes('@');
    setEmailAddressError(emailEmpty || emailInvalid);

    setLowercaseError(!hasLower);
    setUppercaseError(!hasUpper);
    setNumberError(!hasNumber);
    setSpecialCharacterError(!hasSpecial);

    const pwdMissing = !(hasLower && hasUpper && hasNumber && hasSpecial);
    setPasswordError(password.length === 0 || pwdMissing);

    const confirmErr = confirmPassword.length === 0 || password !== confirmPassword;
    setConfirmPasswordError(confirmErr);

    if (!usernameEmpty && !emailInvalid && !pwdMissing && password === confirmPassword && !usernameHasAt) {
      setError('');
    }
  }, [username, emailAddress, password, confirmPassword, hasLower, hasUpper, hasNumber, hasSpecial]);

  // Live validation is handled with useEffect; the previous handleError helper was removed.

  async function handleSignUp() {
    // Final validation before submit
    const isFormValid = username.length > 0 && !username.includes('@') && emailAddress.includes('@') && hasLower && hasUpper && hasNumber && hasSpecial && password === confirmPassword;
    if (!isFormValid) {
      setError('Please fix the highlighted fields before continuing.');
      return;
    }

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await signupUser({
        username,
        nume: fullName,
        email: emailAddress,
        parola: password,
      });

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('userId', response.id);

      // Also update local state
      setUser([
        ...user,
        {
          username,
          emailAddress,
          password,
          id: response.id,
          nume: fullName,
        }
      ]);

      // navigate to home page after successful sign up
      try {
        router.push('../HomePage');
      } catch (e) {
        // ignore navigation errors during dev
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className="mt-6 mb-2 text-center text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Create Account
      </h1>
      <p className="mb-8 text-center text-gray-600 dark:text-gray-400 text-sm">Join our eco-friendly community</p>

      <div className={`mb-3 px-4 py-3 rounded-lg text-center text-sm font-medium transition duration-300 ${
        error 
          ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800' 
          : 'hidden'
      }`}>
        {error}
      </div>

       {/* Username */}
       <Input
         name="Username"
         value={username}
         setValue={setUsername}
         hasError={usernameError}
         errorMessage={username.length === 0 ? 'Username is required' : username.includes('@') ? "Username cannot contain '@'" : ''}
       />
       <Input
         name="Full Name"
         value={fullName}
         setValue={setFullName}
         hasError={fullName.length === 0}
         errorMessage={fullName.length === 0 ? 'Full name is required' : ''}
       />
       <Input
         name="Email Address"
        value={emailAddress}
        setValue={setEmailAddress}
        hasError={emailAddressError}
        errorMessage={emailAddress.length === 0 ? 'Email is required' : !emailAddress.includes('@') ? "Email must contain '@'" : ''}
      />
      <Input
        name="Password"
        value={password}
        setValue={setPassword}
        hasError={passwordError}
        errorMessage={(() => {
          if (password.length === 0) return 'Password is required';
          const missing: string[] = [];
          if (!hasLower) missing.push('one lowercase letter');
          if (!hasUpper) missing.push('one uppercase letter');
          if (!hasNumber) missing.push('one number');
          if (!hasSpecial) missing.push('one special character');
          return missing.length ? `Missing: ${missing.join(', ')}` : '';
        })()}
      />

      <div className="mt-6 max-w-sm mx-auto px-4 py-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Password Requirements</p>
        <ul className="space-y-2">
          <li className={`flex items-center gap-2 text-sm transition duration-300 ${
            lowercaseError ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              lowercaseError ? 'bg-red-200 dark:bg-red-900' : 'bg-emerald-200 dark:bg-emerald-900'
            }`}>
              {lowercaseError ? '✕' : '✓'}
            </span>
            <span>One lowercase letter</span>
          </li>
          <li className={`flex items-center gap-2 text-sm transition duration-300 ${
            uppercaseError ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              uppercaseError ? 'bg-red-200 dark:bg-red-900' : 'bg-emerald-200 dark:bg-emerald-900'
            }`}>
              {uppercaseError ? '✕' : '✓'}
            </span>
            <span>One uppercase letter</span>
          </li>
          <li className={`flex items-center gap-2 text-sm transition duration-300 ${
            numberError ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              numberError ? 'bg-red-200 dark:bg-red-900' : 'bg-emerald-200 dark:bg-emerald-900'
            }`}>
              {numberError ? '✕' : '✓'}
            </span>
            <span>One number</span>
          </li>
          <li className={`flex items-center gap-2 text-sm transition duration-300 ${
            specialCharacterError ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              specialCharacterError ? 'bg-red-200 dark:bg-red-900' : 'bg-emerald-200 dark:bg-emerald-900'
            }`}>
              {specialCharacterError ? '✕' : '✓'}
            </span>
            <span>One special character (!?&#@$*)</span>
          </li>
        </ul>
      </div>

      <Input
        name="Confirm Password"
        value={confirmPassword}
        setValue={setConfirmPassword}
        hasError={confirmPasswordError}
        errorMessage={confirmPassword.length === 0 ? 'Please confirm your password' : password !== confirmPassword ? 'Passwords do not match' : ''}
      />

       {/* Submit button: disabled until form is valid */}
       {(() => {
         const isFormValid = username.length > 0 && !username.includes('@') && emailAddress.includes('@') && hasLower && hasUpper && hasNumber && hasSpecial && password === confirmPassword && fullName.trim().length > 0;
         return (
           <button
             type="button"
             onClick={handleSignUp}
             disabled={!isFormValid || isLoading}
             className={`mt-8 mb-4 mx-auto max-w-sm w-full px-4 py-3 ${isFormValid && !isLoading ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'} text-white font-semibold rounded-lg transition duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95 transform`}
           >
             {isLoading ? (
               <>
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 Creating Account...
               </>
             ) : (
               <>
                 <FiUserPlus size={20} />
                 Create Account
               </>
             )}
           </button>
         );
       })()}
    </>
  )
}

export default function Home() {
  const [user, setUser] = useState([])
  return (
    <main className="flex min-h-screen flex-col bg-(--color-bg-main) text-(--color-text-primary) px-4 py-8 sm:py-12">
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

        <div className="bg-(--color-bg-card) dark:bg-gray-950 rounded-2xl shadow-xl border border-(--color-bg-card) overflow-hidden text-(--color-text-primary)">
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 px-6 py-4 border-b border-(--color-green-accent)">
            <h2 className="text-(--color-text-secondary) text-xs font-semibold uppercase tracking-widest font-(family-name:--font-body)">Sign Up</h2>
          </div>

          <div className="px-6 py-8">
            <SignUp
              user={user}
              setUser={setUser}
            />
          </div>

          <div className="px-6 py-4 bg-(--color-bg-card) border-t border-(--color-green-accent) text-center text-xs text-(--color-text-secondary)">
            <p>Already have an account? <a href="../LogInPage" className="text-(--color-green-primary) hover:opacity-90 font-semibold transition">Log in</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}