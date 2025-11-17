'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { ArrowLeft, Camera, Sun, Moon, Wallet, TrendingUp, PieChart, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/api`;

interface WalletBalance {
  SOL: number;
  USDT: number;
  USDC: number;
}

interface WalletInfo {
  address: string;
  balances: WalletBalance;
  createdAt: Date;
}

interface PFIMetrics {
  score: number;
  index: number;
  share: number;
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'Guest';
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [pfiMetrics, setPfiMetrics] = useState<PFIMetrics>({
    score: 0,
    index: 0,
    share: 0
  });
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    const savedProfile = localStorage.getItem('profilePicture') || '';
    const savedWallet = localStorage.getItem('wallet');
    
    setTheme(savedTheme);
    setProfilePicture(savedProfile);
    
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    }

    // Apply theme
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Fetch PFI metrics from backend
    fetchPFIMetrics();
  }, []);

  const fetchPFIMetrics = async () => {
    try {
      // Use faircoin API directly
      const faircoinAPI = process.env.NEXT_PUBLIC_FAIRCOIN_API_URL || 'https://bixio.xyz/faircoin';
      console.log(`[PFI] Fetching metrics from FairCoin API for user: ${username}`);
      console.log(`[PFI] API URL: ${faircoinAPI}/api/v1/fairness/indexes?user=${encodeURIComponent(username)}`);
      
      const response = await fetch(`${faircoinAPI}/api/v1/fairness/indexes?user=${encodeURIComponent(username)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[PFI] FairCoin API response:', data);
        
        if (data.success && data.index) {
          setPfiMetrics({
            score: data.index.pfi_total || 0,
            index: data.index.total_fairness_score || 0,
            share: data.index.approved_submissions || 0
          });
        } else {
          console.warn('[PFI] API returned success but no index data');
          setPfiMetrics({ score: 0, index: 0, share: 0 });
        }
      } else {
        console.error(`[PFI] FairCoin API failed with status ${response.status}`);
        const errorText = await response.text();
        console.error('[PFI] Error response:', errorText);
        setPfiMetrics({ score: 0, index: 0, share: 0 });
      }
    } catch (error) {
      console.error('[PFI] Error fetching metrics:', error);
      setPfiMetrics({ score: 0, index: 0, share: 0 });
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setProfilePicture(imageUrl);
        localStorage.setItem('profilePicture', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const createWallet = async () => {
    setIsCreatingWallet(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const newWallet: WalletInfo = {
          address: data.data.address,
          balances: data.data.balances || { SOL: 0, USDT: 0, USDC: 0 },
          createdAt: new Date()
        };
        
        setWallet(newWallet);
        localStorage.setItem('wallet', JSON.stringify(newWallet));
        
        // Save secret phrase to localStorage (encrypted in production)
        if (data.data.secretPhrase) {
          localStorage.setItem(`wallet_phrase_${data.data.address}`, data.data.secretPhrase);
        }
        
        // Show secret phrase to user (only shown once during creation)
        if (data.data.secretPhrase) {
          alert(
            `Wallet Created Successfully!\n\n` +
            `IMPORTANT: Save your secret phrase securely!\n\n` +
            `Secret Phrase:\n${data.data.secretPhrase}\n\n` +
            `This will NEVER be shown again. Write it down and keep it safe!\n\n` +
            `Use the "Download Wallet Details" button to save this information.`
          );
        }
      } else {
        alert(data.error || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet. Please try again.');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const refreshWalletBalances = async () => {
    if (!wallet) return;
    
    try {
      console.log('[Wallet] Refreshing balances for address:', wallet.address);
      const balanceURL = `${API_BASE_URL}/wallet/balance?address=${wallet.address}`;
      console.log('[Wallet] Balance API URL:', balanceURL);
      
      const response = await fetch(balanceURL);
      console.log('[Wallet] Balance API response status:', response.status);
      
      const data = await response.json();
      console.log('[Wallet] Balance API response data:', data);
      
      if (data.success && data.data) {
        console.log('[Wallet] Updated balances:', data.data);
        const updatedWallet = {
          ...wallet,
          balances: data.data // API returns WalletBalance directly in data
        };
        setWallet(updatedWallet);
        localStorage.setItem('wallet', JSON.stringify(updatedWallet));
        console.log('[Wallet] Balances updated successfully');
      } else {
        console.warn('[Wallet] API returned success=false or no data');
      }
    } catch (error) {
      console.error('[Wallet] Failed to refresh balances:', error);
      alert('Failed to refresh balances. Please try again.');
    }
  };

  const downloadWalletDetails = () => {
    if (!wallet) return;

    // Get secret phrase from localStorage (if available)
    const secretPhrase = localStorage.getItem(`wallet_phrase_${wallet.address}`) || 'Secret phrase not available (only shown once during creation)';

    const walletDetails = `XCHAT WALLET DETAILS
========================

Username: ${username}
Wallet Address: ${wallet.address}
Network: Solana

Secret Phrase (BIP39 Mnemonic):
${secretPhrase}

IMPORTANT SECURITY NOTES:
- Never share your secret phrase with anyone
- Store this file in a secure location
- Delete this file after backing up to a secure location
- Anyone with access to your secret phrase can access your funds

Created: ${new Date().toISOString()}
`;

    // Create blob and download
    const blob = new Blob([walletDetails], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xchat-wallet-${wallet.address.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/lite?username=${encodeURIComponent(username)}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft size={28} className="text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Camera size={28} className="mr-3 text-green-500" />
            Profile Picture
          </h2>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-linear-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-5xl font-bold">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  username.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600"
              >
                <Camera size={20} />
              </button>
            </div>
            
            <div>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{username}</p>
              <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                Click camera icon to change photo
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
        </section>

        {/* Theme Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            {theme === 'light' ? (
              <Sun size={28} className="mr-3 text-yellow-500" />
            ) : (
              <Moon size={28} className="mr-3 text-blue-500" />
            )}
            Theme
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold text-gray-800 dark:text-white">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                Switch between light and dark theme
              </p>
            </div>
            
            <button
              onClick={handleThemeToggle}
              className={`relative w-20 h-10 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-8 h-8 rounded-full bg-white shadow-md transition-transform ${
                  theme === 'dark' ? 'translate-x-10' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Digital Wallet Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Wallet size={28} className="mr-3 text-purple-500" />
            Digital Wallet (Solana Network)
          </h2>
          
          {wallet ? (
            <>
              {/* Wallet Address */}
              <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Wallet Address</p>
                <p className="text-base text-gray-800 dark:text-white font-mono break-all">
                  {wallet.address}
                </p>
              </div>

              {/* Balances Grid */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* SOL Balance */}
                <div className="border dark:border-gray-700 rounded-xl p-5 bg-linear-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">SOL Balance</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {wallet.balances.SOL.toFixed(4)} SOL
                      </p>
                    </div>
                    <Wallet size={40} className="text-purple-500" />
                  </div>
                </div>

                {/* USDT Balance */}
                <div className="border dark:border-gray-700 rounded-xl p-5 bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">USDT Balance</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {wallet.balances.USDT.toFixed(2)} USDT
                      </p>
                    </div>
                    <TrendingUp size={40} className="text-green-500" />
                  </div>
                </div>

                {/* USDC Balance */}
                <div className="border dark:border-gray-700 rounded-xl p-5 bg-linear-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">USDC Balance</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {wallet.balances.USDC.toFixed(4)} USDC
                      </p>
                    </div>
                    <PieChart size={40} className="text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={refreshWalletBalances}
                  className="py-4 px-6 bg-purple-500 text-white rounded-xl hover:bg-purple-600 text-xl font-semibold"
                >
                  Refresh Balances
                </button>
                <button
                  onClick={downloadWalletDetails}
                  className="py-4 px-6 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-xl font-semibold flex items-center justify-center gap-2"
                >
                  <Download size={24} />
                  Download Details
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Create a Solana wallet to hold SOL, USDT, and USDC all in one address.
              </p>
              
              <button
                onClick={createWallet}
                disabled={isCreatingWallet}
                className="w-full py-4 px-6 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-semibold"
              >
                {isCreatingWallet ? 'Creating Wallet...' : 'Create Solana Wallet'}
              </button>
            </>
          )}
        </section>

        {/* PFI Metrics Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <TrendingUp size={28} className="mr-3 text-green-500" />
            PFI Metrics
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {/* PFI Score */}
            <div className="border dark:border-gray-700 rounded-xl p-5 bg-linear-to-br from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">PFI Score</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {pfiMetrics.score}
                  </p>
                </div>
                <PieChart size={48} className="text-green-500" />
              </div>
              <div className="mt-3 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${(pfiMetrics.score / 1000) * 100}%` }}
                />
              </div>
            </div>

            {/* PFI Index */}
            <div className="border dark:border-gray-700 rounded-xl p-5 bg-linear-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">PFI Index</p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {pfiMetrics.index.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp size={48} className="text-blue-500" />
              </div>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
                Performance indicator
              </p>
            </div>

            {/* PFI Share */}
            <div className="border dark:border-gray-700 rounded-xl p-5 bg-linear-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">PFI Share</p>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {pfiMetrics.share.toFixed(2)}
                  </p>
                </div>
                <Wallet size={48} className="text-purple-500" />
              </div>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
                Your share value
              </p>
            </div>
          </div>

          <button
            onClick={fetchPFIMetrics}
            className="w-full mt-4 py-3 px-6 bg-green-500 text-white rounded-xl hover:bg-green-600 text-lg font-semibold"
          >
            Refresh Metrics
          </button>
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading settings...</div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
