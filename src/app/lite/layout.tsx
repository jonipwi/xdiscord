import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'xChat Lite - Simple Chat for Everyone',
  description: 'Simplified chat experience for elderly users',
};

export default function LiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <header className="bg-linear-to-r from-green-500 to-teal-500 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">xChat Lite</h1>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  );
}
