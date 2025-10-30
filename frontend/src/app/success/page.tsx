'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Receipt } from 'lucide-react';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    setOrderId(searchParams.get('order_id') || '');
    setSessionId(searchParams.get('session_id') || '');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 mb-8">
            Your order has been confirmed and payment completed.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <div className="flex items-start mb-4">
              <Receipt className="w-5 h-5 text-gray-400 mr-3 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {orderId || 'Processing...'}
                </p>
              </div>
            </div>

            {sessionId && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Payment Session</p>
                <p className="font-mono text-xs text-gray-600 break-all">
                  {sessionId}
                </p>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                You'll receive an email confirmation shortly
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Your order is being prepared
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                Track your order status in your account
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Chat
            </button>

            <button
              onClick={() => window.print()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@echoEats.com" className="text-blue-600 hover:underline">
            support@echoEats.com
          </a>
        </p>
      </div>
    </div>
  );
}
