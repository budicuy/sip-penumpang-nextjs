import { useState, useEffect } from 'react';
import axios from 'axios';

interface AuthPayload {
    id: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
}

export function useAuth() {
    const [user, setUser] = useState<AuthPayload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await axios.get('/api/auth/session');
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    return { user, loading };
}
