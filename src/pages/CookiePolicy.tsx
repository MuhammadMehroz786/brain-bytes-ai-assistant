import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1A1A3A] to-[#2D1B69]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
            <p className="text-gray-300">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies?</h2>
              <p className="text-gray-300 mb-6">
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience and allow certain features to function properly.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Types of Cookies We Use</h3>
              
              <h4 className="text-lg font-medium text-white mb-2">Essential Cookies</h4>
              <p className="text-gray-300 mb-4">
                These cookies are necessary for the website to function properly. They enable basic features like page navigation, access to secure areas, and payment processing. The website cannot function properly without these cookies.
              </p>

              <h4 className="text-lg font-medium text-white mb-2">Analytics Cookies</h4>
              <p className="text-gray-300 mb-4">
                We use analytics cookies to understand how visitors interact with our website. This helps us improve our service and user experience. These cookies collect information anonymously.
              </p>

              <h4 className="text-lg font-medium text-white mb-2">Performance Cookies</h4>
              <p className="text-gray-300 mb-6">
                These cookies help us understand which pages are most popular and how users move around the site. This information helps us optimize our website performance.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Your Cookie Choices</h3>
              <p className="text-gray-300 mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="text-gray-300 mb-6 space-y-2">
                <li>• Use our cookie consent banner to accept or reject non-essential cookies</li>
                <li>• Modify your browser settings to block or delete cookies</li>
                <li>• Use browser extensions to manage cookie preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Third-Party Cookies</h3>
              <p className="text-gray-300 mb-6">
                Our website may contain links to third-party services that may set their own cookies. We don't control these cookies and recommend reviewing their privacy policies for more information.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Updates to This Policy</h3>
              <p className="text-gray-300 mb-6">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
              <p className="text-gray-300">
                If you have questions about our use of cookies, please contact us at:
                <br />
                <strong className="text-white">Email:</strong> <a href="mailto:bybrainbytes@gmail.com" className="text-blue-400 hover:text-blue-300">bybrainbytes@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;