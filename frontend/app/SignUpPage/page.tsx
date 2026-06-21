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
          ? 'bg-red-50 border-red-400' 
          : focused 
          ? 'bg-(--color-bg-card) border-(--color-green-primary) shadow-(--color-green-accent)' 
          : 'bg-(--color-bg-card) border-(--color-green-accent)'}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {name === 'Username' ? (
          <FiUser className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-(--color-green-primary)' : 'text-(--color-text-secondary)'
          }`} size={20} />
        ) : name === 'Email Address' ? (
          <FiMail className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-(--color-green-primary)' : 'text-(--color-text-secondary)'
          }`} size={20} />
        ) : name === 'Full Name' ? (
          <FiUser className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-(--color-green-primary)' : 'text-(--color-text-secondary)'
          }`} size={20} />
        ) : (
          <FiLock className={`shrink-0 transition duration-300 ${
            hasError ? 'text-red-500' : focused ? 'text-(--color-green-primary)' : 'text-(--color-text-secondary)'
          }`} size={20} />
        )}

        <input
          type={name === 'Password' || name === 'Confirm Password' ? visible ? 'text' : 'password' : 'text'}
          placeholder={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent text-base font-medium ${hasError ? 'text-red-500' : 'text-(--color-text-primary)'} placeholder-(--color-text-secondary) outline-none font-(family-name:--font-body)"
        />

        {name === 'Password' || name === 'Confirm Password' ? (
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
      <h1 className="mb-2 text-center text-[28px] font-bold leading-tight text-(--color-text-primary) font-(family-name:--font-logo)">
        Create Account
      </h1>
      <p className="mb-6 text-center text-sm text-(--color-text-secondary) font-(family-name:--font-body)">Join our eco-friendly community</p>

      <div className={`mb-3 px-4 py-3 rounded-lg text-center text-sm font-medium transition duration-300 ${
        error 
          ? 'bg-red-50 text-red-700 border border-red-300' 
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

      <div className="mx-auto mt-6 max-w-sm rounded-xl border-l-4 border-(--color-green-primary) bg-(--color-bg-main) px-4 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-text-primary) font-(family-name:--font-header)">Password Requirements</p>
        <ul className="space-y-2">
          <li className={`flex items-center gap-2 text-sm transition duration-300 ${
            lowercaseError ? 'text-red-500' : 'text-(--color-green-primary)'
          }`}>
            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              lowercaseError ? 'bg-red-100' : 'bg-(--color-green-accent)'
            }`}>
              {lowercaseError ? '✕' : '✓'}
            </span>
            <span>One lowercase letter</span>
          </li>
          <li className={`flex items-center gap-2 text-sm transition duration-300 ${
            uppercaseError ? 'text-red-500' : 'text-(--color-green-primary)'
          }`}>
            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              uppercaseError ? 'bg-red-100' : 'bg-(--color-green-accent)'
            }`}>
              {uppercaseError ? '✕' : '✓'}
            </span>
            <span>One uppercase letter</span>
          </li>
          <li className={`flex items-center gap-2 text-sm transition duration-300 ${
            numberError ? 'text-red-500' : 'text-(--color-green-primary)'
          }`}>
            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              numberError ? 'bg-red-100' : 'bg-(--color-green-accent)'
            }`}>
              {numberError ? '✕' : '✓'}
            </span>
            <span>One number</span>
          </li>
          <li className={`flex items-center gap-2 text-sm transition duration-300 ${
            specialCharacterError ? 'text-red-500' : 'text-(--color-green-primary)'
          }`}>
            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              specialCharacterError ? 'bg-red-100' : 'bg-(--color-green-accent)'
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
             className={`mt-8 mb-4 mx-auto flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-lg text-base font-bold text-(--color-text-on-green) shadow-lg transition font-(family-name:--font-header) ${isFormValid && !isLoading ? 'cursor-pointer bg-(--color-green-primary) hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-(--color-green-primary)/30' : 'cursor-not-allowed bg-(--color-text-secondary) opacity-60'}`}
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
            Create your account.
          </h1>
          <p className="mt-2 text-[20px] font-medium text-white/85 font-(family-name:--font-header)">
            Scan. Sort. Share.
          </p>
        </div>

        <div className="w-full px-6 pb-7 pt-6">
          <div className="mb-5 rounded-xl border-l-4 border-(--color-green-primary) bg-(--color-bg-main) p-4">
            <p className="font-semibold text-(--color-text-primary) font-(family-name:--font-header)">
              Join the recycling flow
            </p>
            <p className="mt-1 text-sm leading-6 text-(--color-text-secondary) font-(family-name:--font-body)">
              Set up your profile to track progress, earn points, and use the
              sorting tools.
            </p>
          </div>

          <SignUp
            user={user}
            setUser={setUser}
          />

          <div className="mt-5 text-center text-sm text-(--color-text-secondary) font-(family-name:--font-body)">
            <p>
              Already have an account?{" "}
              <a
                href="../LogInPage"
                className="font-semibold text-(--color-green-primary) transition hover:opacity-90"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
