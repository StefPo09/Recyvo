"use client";

import Image from "next/image";
import {useState} from "react";
import { FiUser, FiMail, FiUserPlus, FiLock } from 'react-icons/fi';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';

function Input({ name, value, setValue, hasError }: { name: string, value: any, setValue: any, hasError: boolean }){
  const [visible, setVisible] = useState(false);

  function toggleVisibility(){
    setVisible(!visible);
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-10 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className={`flex items-center border rounded-lg p-2 bg-white transition shadow-sm hover:shadow-md 
        ${hasError ? 'focus-within:ring-2 focus-within:ring-red-500 border-red-500' : 'focus-within:ring-2 focus-within:ring-blue-400 border-gray-300'}`}
      >
        {name === 'Username' ? (
          <FiUser className="text-gray-400 mr-2" size={20} />
        ) : name === 'Email Address' ? (
          <FiMail className="text-gray-400 mr-2" size={20} />
        ) : (
          <FiLock className="text-gray-400 mr-2" size={20} />
        )}

        <input
          type={name === 'Password' || name === 'Confirm Password' ? visible ? 'text' : 'password' : 'text'}
          placeholder={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full outline-none text-gray-700 placeholder-gray-400"
        />

        {name === 'Password' || name === 'Confirm Password' ? (
          <button
            type="button"
            onClick={toggleVisibility}
            className="text-gray-400 hover:text-green-500 focus:outline-none transition"
          >
            {visible ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function SignUp({ user, setUser }: { user: any, setUser: any }) {
  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [emailAddressError, setEmailAddressError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [lowercaseError, setLowercaseError] = useState(false);
  const [uppercaseError, setUppercaseError] = useState(false);
  const [numberError, setNumberError] = useState(false);
  const [specialCharacterError, setSpecialCharacterError] = useState(false);

  function handleError() {
    if (username.length === 0 || emailAddress.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      setError("All fields are required!");
      if (username.length === 0) {
        setUsernameError(true);
      } else {
        setUsernameError(false);
      }
      if (emailAddress.length === 0) {
        setEmailAddressError(true);
      } else {
        setEmailAddressError(false);
      }
      if (password.length === 0) {
        setPasswordError(true);
      } else {
        setPasswordError(false);
      }
      if (confirmPassword.length === 0) {
        setConfirmPasswordError(true);
      } else {
        setConfirmPasswordError(false);
      }
      return true;
    } else {
      setUsernameError(false);
      setEmailAddressError(false);
      setPasswordError(false);
      setConfirmPasswordError(false);
    }
    if (!emailAddress.includes('@')) {
      setError("Email address is not valid!");
      setEmailAddressError(true);
      return true;
    } else {
      setEmailAddressError(false);
    }
    if (!(/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!?&#@$*]/.test(password))) {
      setError("Password does not match the requirement!");
      setPasswordError(true);
      if (!/[a-z]/.test(password)) {
        setLowercaseError(true);
      } else {
        setLowercaseError(false);
      }
      if (!/[A-Z]/.test(password)) {
        setUppercaseError(true);
      } else {
        setUppercaseError(false);
      }
      if (!/[0-9]/.test(password)) {
        setNumberError(true);
      } else {
        setNumberError(false);
      }
      if (!/[!?&#@$*]/.test(password)) {
        setSpecialCharacterError(true);
      } else {
        setSpecialCharacterError(false);
      }
      return true;
    } else {
      setPasswordError(false);
      setLowercaseError(false);
      setUppercaseError(false);
      setNumberError(false);
      setSpecialCharacterError(false);
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setPasswordError(true);
      setConfirmPasswordError(true);
      return true;
    } else {
      setPasswordError(false);
      setConfirmPasswordError(false);
    }
    setError("");
    return false;
  }

  function handleSignUp() {
    if (!handleError()) {
      setUser ([
        ...user,
        {
          username,
          emailAddress,
          password,
          id: crypto.randomUUID()
        }]);
    }
  }

  return (
    <>
      <h1 className="mt-4 mb-4 text-center text-[36px] leading-none tracking-normal text-[#1A2B23] dark:text-green-200">
        SIGN UP
      </h1>
      <p className="mb-4 text-center text-red-500">{error}</p>
      <Input
        name="Username"
        value={username}
        setValue={setUsername}
        hasError={usernameError}
      />
      <Input
        name="Email Address"
        value={emailAddress}
        setValue={setEmailAddress}
        hasError={emailAddressError
      }
      />
      <Input
        name="Password"
        value={password}
        setValue={setPassword}
        hasError={passwordError}
      />
      <div className="pl-10 items-center justify-center text-[24px]">
        <p className={"text-white"}>Must contain at least:</p>
        <ul className={"list-disc"}>
          <li className={`${lowercaseError ? 'text-red-500' : 'text-white'}`}>one lowercase letter</li>
          <li className={`${uppercaseError ? 'text-red-500' : 'text-white'}`}>one uppercase letter</li>
          <li className={`${numberError ? 'text-red-500' : 'text-white'}`}>one number</li>
          <li className={`${specialCharacterError ? 'text-red-500' : 'text-white'}`}>one special character(!?&#@$*)</li>
        </ul>
      </div>
      <Input
        name="Confirm Password"
        value={confirmPassword}
        setValue={setConfirmPassword}
        hasError={confirmPasswordError}
      />
      <button
        onClick={handleSignUp}
        className="flex mt-5 mb-5 w-full justify-center text-white"
      >Create Account<FiUserPlus className="text-gray-400 mr-2" size={20} /></button>
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