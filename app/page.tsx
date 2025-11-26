"use client";

import Logo from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

import { useState, useEffect } from 'react';

function page() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Session check failed", err);
      }
    };
    checkSession();
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <header className="flex justify-between items-center p-6 border-b border-slate-100">
        <Logo />
        <Button variant="outline" onClick={() => router.push(isLoggedIn ? "/app" : "/login")}>
          {isLoggedIn ? "DASHBOARD" : "LOGIN"}
        </Button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-5xl mx-auto w-full">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Logistics for engineers.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            KNT TECH - Track every part, every location, every update.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          <Card className="p-12 flex flex-col items-center justify-center hover:shadow-lg transition-all cursor-pointer group border-2 border-slate-100 hover:border-blue-100">
            <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors">
              GET STARTED
            </h3>
            <p className="text-slate-500 mb-6">
              Start tracking your inventory today.
            </p>
            <Button className="w-full" onClick={() => router.push(isLoggedIn ? "/app" : "/login")}>
              {isLoggedIn ? "Go to Dashboard" : "Start Now"}
            </Button>
          </Card>

          <Card className="p-12 flex flex-col items-center justify-center hover:shadow-lg transition-all cursor-pointer group border-2 border-slate-100 hover:border-slate-300">
            <h3 className="text-2xl font-bold mb-4 group-hover:text-slate-600 transition-colors">
              LEARN MORE
            </h3>
            <p className="text-slate-500 mb-6">
              Discover our advanced features.
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.push("/documentation")}>
              Read Documentation
            </Button>
          </Card>
        </div>
      </main>

      <footer className="border-t border-slate-100 p-6">
        <div className="flex justify-center space-x-8 text-sm text-slate-500 font-medium">
          <button className="hover:text-slate-900" onClick={() => router.push("/about")}>ABOUT</button>
          <span className="text-slate-300">|</span>
          <button className="hover:text-slate-900" onClick={() => router.push("/contact")}>CONTACT</button>
          <span className="text-slate-300">|</span>
          <button className="hover:text-slate-900" onClick={() => router.push("/privacy")}>PRIVACY</button>
        </div>
      </footer>
    </div>
  );
}

export default page;
