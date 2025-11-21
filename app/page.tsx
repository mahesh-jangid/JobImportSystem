'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ jobCount: 0, lastImport: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/jobs?limit=1');
        const data = await response.json();
        if (data.success) {
          setStats({
            jobCount: data.data.total,
            lastImport: new Date().toLocaleString(),
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚀 Job Import System
          </h1>
          <div className="flex gap-4">
            <Link
              href="/import-history"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Scalable Job Import System
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Pull jobs from multiple APIs, queue them with Redis, import into MongoDB with worker processes, and track everything in real-time.
          </p>
          <Link
            href="/import-history"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Import History →
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {loading ? '...' : stats.jobCount}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Total Jobs Imported</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">9+</div>
            <p className="text-gray-600 dark:text-gray-400">Active Job Sources</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">⏰</div>
            <p className="text-gray-600 dark:text-gray-400">Auto-refresh Every Hour</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Key Features</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  📥 Multi-Source Integration
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Fetches jobs from 9 different Jobicy feeds plus Higher Ed Jobs API with automatic XML-to-JSON conversion.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ⚡ Queue-Based Processing
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Redis-backed BullMQ queue with configurable concurrency and automatic retry logic with exponential backoff.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  💾 Duplicate Detection
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Automatically detects and updates existing jobs to prevent duplicates while maintaining data freshness.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  📊 Real-Time Tracking
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete import history with detailed statistics including success rates, failure reasons, and performance metrics.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  🔄 Automatic Scheduling
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Cron-based scheduler runs import jobs every hour automatically without manual intervention.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  🚀 Production Ready
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete with Docker support, comprehensive error handling, and environment configuration for any deployment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">System Architecture</h3>
          </div>
          <div className="p-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-6 font-mono text-sm overflow-auto">
              <pre className="text-gray-700 dark:text-gray-300">{`External APIs (9 sources)
        ↓
    Cron Job (Every 1 hour)
        ↓
Job Fetcher Service (XML → JSON)
        ↓
    Redis Queue (BullMQ)
        ↓
Worker Processes (Concurrency: 5)
        ↓
Job Import Service (Duplicate detection)
        ↓
MongoDB (Storage) + ImportLog (History)
        ↓
Admin Dashboard (Real-time View)`}</pre>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Technology Stack</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Frontend', value: 'Next.js 16' },
                { label: 'Backend', value: 'Node.js + Express' },
                { label: 'Database', value: 'MongoDB 4.4+' },
                { label: 'Queue', value: 'BullMQ (Redis)' },
                { label: 'Language', value: 'TypeScript' },
                { label: 'Scheduling', value: 'node-cron' },
                { label: 'Styling', value: 'Tailwind CSS' },
                { label: 'Deployment', value: 'Docker' },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                    {item.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ready to see the system in action?
          </p>
          <Link
            href="/import-history"
            className="inline-block px-10 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Import History Dashboard →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>Scalable Job Import System • Designed for Production</p>
        </div>
      </footer>
    </div>
  );
}
