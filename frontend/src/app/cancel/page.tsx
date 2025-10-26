'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, MessageSquare } from 'lucide-react';

export default function PaymentCanceled() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Cancel Icon */}
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-orange-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Canceled
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 mb-8">
            Your payment was canceled and no charges were made to your card.
          </p>

          {/* Info Box */}
          <div className="bg-orange-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What happened?</h3>
            <p className="text-sm text-gray-700 mb-4">
              You left the payment page before completing your purchase. Your order has not been placed.
            </p>

            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>No payment was processed</strong>
              </p>
              <p className="text-xs text-gray-500">
                If this was a mistake, you can return to the chat and place your order again.
              </p>
            </div>
          </div>

          {/* What You Can Do */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">What can you do?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Return to chat and try placing your order again
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Modify your order before checkout
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Contact support if you need assistance
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Return to Chat
            </button>

            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help?{' '}
          <a href="mailto:support@echoEats.com" className="text-blue-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
