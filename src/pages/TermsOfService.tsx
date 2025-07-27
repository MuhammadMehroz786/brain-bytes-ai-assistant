import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <p className="text-gray-300 mb-8">Last updated: July 13, 2025</p>
          
          <p className="text-gray-300 mb-8">
            Welcome to Brain Bytes. These Terms of Service ("Terms") govern your access to and use of our website and AI productivity assistant ("Service"). By accessing or using the Service, you agree to be bound by these Terms.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">1.</span>
                Use of the Service
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not misuse the Service or interfere with its operation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">2.</span>
                Accounts and Access
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  You may be required to create an account and provide information to use certain features. You're responsible for maintaining the confidentiality of your account credentials and for any activity under your account.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">3.</span>
                Privacy
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  We collect and use personal data according to our Privacy Policy. By using the Service, you agree to the collection and use of information as described in that policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">4.</span>
                Intellectual Property
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  All content, features, and functionality of the Service are owned by Brain Bytes or its licensors and are protected by applicable intellectual property laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">5.</span>
                Third-Party Services
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  The Service may integrate with third-party tools (e.g. Google Calendar, Gmail). We're not responsible for the content, privacy policies, or practices of any third-party service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">6.</span>
                Termination
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to suspend or terminate access to the Service at any time, with or without cause or notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">7.</span>
                Disclaimer
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">8.</span>
                Limitation of Liability
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  To the fullest extent permitted by law, Brain Bytes shall not be liable for any indirect, incidental, or consequential damages arising out of or in connection with your use of the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">9.</span>
                Changes to Terms
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  We may update these Terms from time to time. Changes will be posted on this page and are effective immediately upon posting.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">10.</span>
                Contact Us
              </h2>
              <div className="border-l-2 border-gray-600 pl-6">
                <p className="text-gray-300 leading-relaxed">
                  If you have questions about these Terms, please contact us at oliveregeskov@gmail.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;