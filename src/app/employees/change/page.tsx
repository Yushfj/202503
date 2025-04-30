import { Suspense } from 'react';
import ChangeEmployeeForm from './change-employee-form'; // Import the new client component
import Image from 'next/image'; // Keep Image for background

// This is now a Server Component by default (no 'use client')
const ChangeEmployeeInfoPage = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Background Image */}
      <Image
        src="/red-and-black-gaming-wallpapers-top-red-and-black-lightning-dark-gamer.jpg"
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0 w-full h-full -z-10"
        priority
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 w-full h-full bg-black opacity-50 -z-9" />

      {/* Wrap the client component in Suspense */}
      {/* This allows Next.js to render the fallback on the server
          while the client component that uses useSearchParams() loads on the client. */}
      <Suspense fallback={
        <div className="text-white text-center text-xl">Loading employee data...</div>
        // You can create a more sophisticated loading skeleton here
      }>
        <ChangeEmployeeForm />
      </Suspense>
    </div>
  );
};

export default ChangeEmployeeInfoPage;
