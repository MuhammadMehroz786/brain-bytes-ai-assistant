import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
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
            <h1 className="text-4xl font-bold text-white mb-4">Refund Policy</h1>
            <p className="text-gray-300">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-semibold text-white mb-4">No Refunds Policy</h2>
              
              <p className="text-gray-300 mb-6">
                Thank you for choosing Brain Bytes. Please read this refund policy carefully before making your purchase.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Digital Product Policy</h3>
              <p className="text-gray-300 mb-6">
                Brain Bytes is a digital productivity platform that provides immediate access to AI-powered tools and personalized setup configurations. Due to the nature of our digital service, <strong className="text-white">all sales are final and no refunds will be issued</strong> under any circumstances.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Why No Refunds?</h3>
              <ul className="text-gray-300 mb-6 space-y-2">
                <li>• Immediate access to digital content and configurations</li>
                <li>• Personalized AI setup that cannot be "returned"</li>
                <li>• One-time fee structure with lifetime access</li>
                <li>• Substantial value delivered upon purchase completion</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Before You Purchase</h3>
              <p className="text-gray-300 mb-6">
                We encourage you to carefully review our service description and ensure that Brain Bytes meets your needs before completing your purchase. If you have any questions about our platform, please contact us at <a href="mailto:bybrainbytes@gmail.com" className="text-blue-400 hover:text-blue-300">bybrainbytes@gmail.com</a> before making your purchase.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Technical Support</h3>
              <p className="text-gray-300 mb-6">
                While we cannot offer refunds, we are committed to helping you get the most out of Brain Bytes. If you experience technical issues or need assistance with your setup, our support team is available to help you resolve any problems.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Contact Information</h3>
              <p className="text-gray-300">
                If you have questions about this refund policy, please contact us at:
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

export default RefundPolicy;