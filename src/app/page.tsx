import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [typing, setTyping] = useState("");

  useEffect(() => {
    const tagline = "A modern web application boilerplate with built-in agent framework, authentication, and workflow management.";
    let index = 0;

    const interval = setInterval(() => {
      setTyping(tagline.slice(0, index));
      index++;
      if (index > tagline.length) {
        index = 0;
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/path/to/your/splash-bg.jpg')" }}></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <main className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Agent<span className="text-indigo-400">Plate</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            {typing}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transform transition-transform hover:scale-105">
              <div className="text-indigo-400 text-2xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Authentication Ready</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Secure authentication system powered by Supabase with role-based access control.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transform transition-transform hover:scale-105">
              <div className="text-indigo-400 text-2xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Agent Framework</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built-in agent system for automated task execution and workflow management.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transform transition-transform hover:scale-105">
              <div className="text-indigo-400 text-2xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Modern Stack</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Next.js 13+, TypeScript, Tailwind CSS, and more for rapid development.
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-colors transform transition-transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 border border-indigo-400 text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-colors transform transition-transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        </main>

        <footer className="mt-20 text-center text-gray-300 dark:text-gray-400">
          <div className="flex justify-center gap-8">
            <div className="flex items-center transform transition-transform hover:scale-105">
              <Image
                src="/file.svg"
                alt="Documentation"
                width={20}
                height={20}
                className="mr-2"
              />
              Documentation
            </div>
            <div className="flex items-center transform transition-transform hover:scale-105">
              <Image
                src="/globe.svg"
                alt="Community"
                width={20}
                height={20}
                className="mr-2"
              />
              Community
            </div>
            <div className="flex items-center transform transition-transform hover:scale-105">
              <Image
                src="/window.svg"
                alt="Examples"
                width={20}
                height={20}
                className="mr-2"
              />
              Examples
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
