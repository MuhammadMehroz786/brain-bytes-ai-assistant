import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1A1A3A] to-[#2D1B69] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-none">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <p className="text-gray-300 mb-8">Last updated: July 13, 2025</p>
          
          <p className="text-gray-300 mb-8">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our AI productivity assistant.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. What We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              We collect limited personal information including your name, email address, and answers to onboarding questions. If you choose to connect your Google Calendar or Gmail, we access calendar events and/or inbox metadata (subject, sender, timestamp) to generate personalized insights. We do not store the content of your emails.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">We use your data to:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Personalize your AI dashboard experience</li>
              <li>Display calendar events or summarize recent emails (if connected)</li>
              <li>Send optional productivity summaries (if opted in)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Store and Protect Your Data</h2>
            <p className="text-gray-300 leading-relaxed">
              Data is securely stored using Supabase. All OAuth tokens are encrypted, and we follow industry best practices to safeguard your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell or share your personal data with third parties. Your Google account data is only used internally to provide the features you've opted into.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You can disconnect your Google account at any time or request data deletion by contacting: Oliveregeskov@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions or concerns, contact us at Oliveregeskov@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;