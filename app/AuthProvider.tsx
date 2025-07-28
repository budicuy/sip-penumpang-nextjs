'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// Komponen ini HANYA untuk membungkus aplikasi dengan SessionProvider dari NextAuth
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
