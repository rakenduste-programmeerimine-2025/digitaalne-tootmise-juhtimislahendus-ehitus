"use client"

import Logo from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'

function page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/me');
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('user', JSON.stringify(data.user));
                    router.push('/app');
                }
            } catch (err) {
                console.error("Session check failed", err);
            }
        };
        checkSession();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to login');
            }

            localStorage.setItem('user', JSON.stringify(data.data));
            router.push('/app');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 scale-125">
        <Logo />
      </div>
      
      <Card className="w-full max-w-md p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-center mb-6">SIGN IN</h2>
        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
                {error}
            </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">EMAIL</label>
            <Input 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">PASSWORD</label>
            <Input 
              type="password"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Signing in...' : 'CONTINUE'}
          </Button>
        </form>
      </Card>

      <div className="mt-8 text-center bg-white p-6 rounded-xl w-full max-w-md border border-slate-200 shadow-sm">
        <p className="text-slate-600">New? <button className="text-blue-600 font-semibold hover:underline" onClick={() => router.push('/register')}>Get started!</button></p>
      </div>
    </div>
    )
}

export default page