"use client"

import Logo from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'

function register() {
  const router = useRouter(); 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    orgName: '',
    authConfirmed: false,
    tosConfirmed: false
  });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.authConfirmed || !formData.tosConfirmed) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      localStorage.setItem('user', JSON.stringify(data.data.user));
      router.push('/app');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 scale-125">
        <Logo />
      </div>
      
      <Card className="w-full max-w-lg p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-center mb-6">CREATE ACCOUNT</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">FIRST NAME</label>
              <Input 
                name="firstName"
                placeholder="Jane" 
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">LAST NAME</label>
              <Input 
                name="lastName"
                placeholder="Doe" 
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">EMAIL</label>
            <Input 
              name="email"
              type="email"
              placeholder="name@company.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">ORGANIZATION NAME</label>
            <Input 
              name="orgName"
              placeholder="Company Inc." 
              value={formData.orgName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">PASSWORD</label>
            <Input 
              name="password"
              type="password"
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="authConfirmed"
                checked={formData.authConfirmed}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                required
              />
              <span className="text-xs text-slate-600 leading-tight">
                I confirm that I am authorized to create an account on behalf of the mentioned organization.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="tosConfirmed"
                checked={formData.tosConfirmed}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                required
              />
              <span className="text-xs text-slate-600 leading-tight">
                I agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading || !formData.authConfirmed || !formData.tosConfirmed}>
            {loading ? 'Creating Account...' : 'SIGN UP'}
          </Button>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
              {error}
            </div>
          )}
        </form>
      </Card>

      <div className="mt-8 text-center bg-white p-6 rounded-xl w-full max-w-lg border border-slate-200 shadow-sm">
        <p className="text-slate-600">Already have an account? <button className="text-blue-600 font-semibold hover:underline" onClick={() => router.push('/login')}>Sign in</button></p>
      </div>
    </div>
  );
}

export default register