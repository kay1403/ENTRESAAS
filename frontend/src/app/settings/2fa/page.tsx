'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, Shield, QrCode, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TwoFactorPage() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await api.get2FAStatus();
      setIsEnabled(status.isEnabled);
    } catch (error) {
      toast.error('Error loading 2FA status');
    }
  };

  const handleEnable = async () => {
    try {
      setIsLoading(true);
      const data = await api.generate2FA();
      setQrCode(data.qrCode);
      setShowQR(true);
    } catch (error) {
      toast.error('Error generating 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      await api.enable2FA(verificationToken);
      setIsEnabled(true);
      setShowQR(false);
      toast.success('2FA enabled successfully');
    } catch (error) {
      toast.error('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;
    try {
      setIsLoading(true);
      await api.disable2FA();
      setIsEnabled(false);
      toast.success('2FA disabled');
    } catch (error) {
      toast.error('Error disabling 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-medium text-gray-900">2FA Settings</h2>
          </div>

          {!showQR ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">
                    {isEnabled ? '2FA is enabled' : '2FA is disabled'}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {!isEnabled ? (
                <button
                  onClick={handleEnable}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {isLoading ? 'Generating...' : 'Enable 2FA'}
                </button>
              ) : (
                <button
                  onClick={handleDisable}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {isLoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                {qrCode && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCode} alt="2FA QR Code" className="mx-auto border rounded-lg p-2" />
                )}
                <p className="mt-2 text-sm text-gray-600">
                  Scan this QR code with Google Authenticator
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleVerify}
                  disabled={isLoading || verificationToken.length !== 6}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  onClick={() => setShowQR(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
