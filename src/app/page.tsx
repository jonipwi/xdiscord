'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Get query parameters from current URL
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username') || 'Guest';
    
    // Redirect to lite version with username preserved
    router.replace(`/lite?username=${encodeURIComponent(username)}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-2xl text-gray-500">Redirecting to lite version...</p>
      </div>
    </div>
  );
}
