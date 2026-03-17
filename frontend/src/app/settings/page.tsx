'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Shield, QrCode, Key, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      const status = await api.get2FAStatus();
      setIs2FAEnabled(status.isEnabled);
    } catch (error) {
      toast.error('Error loading 2FA status');
    }
  };

  const handleEnable2FA = async () => {
    try {
      setIsLoading(true);
      const data = await api.generate2FA();
      setQrCode(data.qrCode);
      setShowQRCode(true);
    } catch (error) {
      toast.error('Error generating 2FA secret');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.enable2FA(verificationToken);
      
      if (response.backupCodes) {
        // Afficher les codes de secours
        alert(`Save these backup codes:\n${response.backupCodes.join('\n')}`);
      }
      
      setIs2FAEnabled(true);
      setShowQRCode(false);
      setVerificationToken('');
      toast.success('2FA enabled successfully');
    } catch (error) {
      toast.error('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }

    try {
      setIsLoading(true);
      await api.disable2FA();
      setIs2FAEnabled(false);
      toast.success('2FA disabled successfully');
    } catch (error) {
      toast.error('Error disabling 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Two-Factor Authentication Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Status</h3>
                <p className="text-sm text-gray-600">
                  {is2FAEnabled 
                    ? 'Two-factor authentication is enabled' 
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                is2FAEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {!is2FAEnabled ? (
              <button
                onClick={handleEnable2FA}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Enable 2FA'}
              </button>
            ) : (
              <button
                onClick={handleDisable2FA}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            )}
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Two-Factor Authentication</h3>
              
              <div className="mb-4 text-center">
                {qrCode && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCode} alt="2FA QR Code" className="mx-auto border rounded-lg p-2" />
                )}
                <p className="mt-2 text-sm text-gray-600">
                  Scan this QR code with Google Authenticator or any TOTP app
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-center text-2xl tracking-widest"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowQRCode(false);
                    setVerificationToken('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify2FA}
                  disabled={isLoading || verificationToken.length !== 6}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
