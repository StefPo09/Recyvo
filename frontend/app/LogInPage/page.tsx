"use client";

import Image from "next/image";
import {useState} from "react";
import { FiUser, FiLock } from 'react-icons/fi';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import Link from "next/link";

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
        {name === 'Username or Email' ? (
          <FiUser className="text-gray-400 mr-2" size={20} />
        ) : (
          <FiLock className="text-gray-400 mr-2" size={20} />
        )}

        <input
          type={name === 'Password' ? visible ? 'text' : 'password' : 'text'}
          placeholder={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full outline-none text-gray-700 placeholder-gray-400"
        />

        {name === 'Password' ? (
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

function LogIn() {
  const [usernameEmail, setUsernameEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [usernameEmailError, setUsernameEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  function handleError() {
    if (usernameEmail.length === 0 || password.length === 0) {
      setError("All fields are required!");
      if (usernameEmail.length === 0) {
        setUsernameEmailError(true);
      } else {
        setUsernameEmailError(false);
      }
      if (password.length === 0) {
        setPasswordError(true);
      } else {
        setPasswordError(false);
      }
      return true;
    } else {
      setUsernameEmailError(false);
      setPasswordError(false);
    }
    setError("");
    return false;
  }

  function handleSubmit() {
    if (!handleError()) {
      if (usernameEmail.includes('@')) {
        // Cauta folosind mail
      } else {
        //Cauta folosind username
      }
    }
  }

  return (
    <>
      <h1 className="mt-4 mb-4 text-center text-[36px] leading-none tracking-normal text-[#1A2B23] dark:text-green-200">
        LOGIN
      </h1>
      <p className="mb-4 text-center text-red-500">{error}</p>
      <Input
        name="Username or Email"
        value={usernameEmail}
        setValue={setUsernameEmail}
        hasError={usernameEmailError}
      />
      <Input
        name="Password"
        value={password}
        setValue={setPassword}
        hasError={passwordError}
      />
      <button
        onClick={handleSubmit} // Cauta user in baza de date
        className="flex mt-5 mb-5 w-full justify-center text-white"
      >Log In<FiUser className="text-gray-400 mr-2" size={20} /></button>
      <Link
        href={"../SignUpPage"}
        className="text-white">
        Don't have an account?
      </Link>
    </>
  )
}

export default function Home() {
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
        <LogIn />
      </div>
    </main>
  );
}