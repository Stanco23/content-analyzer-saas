"use client";

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

export function AuthButton() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }

  return (
    <SignInButton mode="modal">
      <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
        Sign In
      </button>
    </SignInButton>
  );
}
