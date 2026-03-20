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
      toast.error('Erreur lors du chargement du statut 2FA');
    }
  };

  const handleEnable = async () => {
    try {
      setIsLoading(true);
      const data = await api.generate2FA();
      setQrCode(data.qrCode);
      setShowQR(true);
    } catch (error) {
      toast.error('Erreur lors de la génération du code 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      setIsLoading(true);
      await api.enable2FA(verificationToken);
      setIsEnabled(true);
      setShowQR(false);
      toast.success('2FA activé avec succès');
    } catch (error) {
      toast.error('Code de vérification invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver la 2FA ?')) return;
    try {
      setIsLoading(true);
      await api.disable2FA();
      setIsEnabled(false);
      toast.success('2FA désactivé');
    } catch (error) {
      toast.error('Erreur lors de la désactivation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Authentification à deux facteurs</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Paramètres 2FA</h2>
          </div>

          {!showQR ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Statut</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isEnabled ? 'La 2FA est activée' : 'La 2FA est désactivée'}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isEnabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>

              {!isEnabled ? (
                <button
                  onClick={handleEnable}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {isLoading ? 'Génération...' : 'Activer la 2FA'}
                </button>
              ) : (
                <button
                  onClick={handleDisable}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {isLoading ? 'Désactivation...' : 'Désactiver la 2FA'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                {qrCode && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCode} alt="QR Code 2FA" className="mx-auto border rounded-lg p-2" />
                )}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Scannez ce code QR avec Google Authenticator
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleVerify}
                  disabled={isLoading || verificationToken.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Vérification...' : 'Vérifier et activer'}
                </button>
                <button
                  onClick={() => setShowQR(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
