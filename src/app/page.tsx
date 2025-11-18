'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';

// Environment-based configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/api`;

export default function Home() {
  const router = useRouter();
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function validateAndRedirect() {
      try {
        // Get query parameters from current URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const username = params.get('username');
        
        // If token is provided, validate it
        if (token) {
          console.log('[XChat] Validating token from faircoin.app');
          
          const response = await fetch(`${API_BASE_URL}/auth/validate?token=${encodeURIComponent(token)}`);
          const data = await response.json();
          
          if (data.valid && data.username) {
            console.log('[XChat] Token valid, authenticated as:', data.username);
            
            // Redirect to lite version with validated credentials
            const walletParam = data.wallet ? `&wallet=${encodeURIComponent(data.wallet)}` : '';
            router.replace(`/lite?username=${encodeURIComponent(data.username)}${walletParam}&token=${encodeURIComponent(token)}`);
            return;
          } else {
            console.error('[XChat] Token validation failed:', data.error);
            setError(data.error || 'Invalid authentication token');
            setValidating(false);
            return;
          }
        }
        
        // Fallback to username parameter (for backward compatibility)
        if (username) {
          console.log('[XChat] Using username parameter (no token validation)');
          router.replace(`/lite?username=${encodeURIComponent(username)}`);
          return;
        }
        
        // No authentication provided
        setError('No authentication token provided. Please access this page from FairCoin.');
        setValidating(false);
      } catch (err) {
        console.error('[XChat] Validation error:', err);
        setError('Failed to validate authentication. Please try again.');
        setValidating(false);
      }
    }

    validateAndRedirect();
  }, [router]);

  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-2xl text-gray-500">Validating authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            {error.includes('token') ? (
              <Lock className="w-8 h-8 text-red-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="https://faircoin.bixio.xyz"
            className="inline-block bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Go to FairCoin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-2xl text-gray-500">Redirecting to FairCoin Chat Lite...</p>
      </div>
    </div>
  );
}
