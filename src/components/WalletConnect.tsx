import React, { useState, useEffect } from 'react';
import { Wallet, ExternalLink, Copy, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { 
  connectWallet, 
  disconnectWallet, 
  getAccountBalance, 
  formatAlgoAmount, 
  isValidAddress,
  createDemoAccount
} from '../services/algorand';

interface WalletConnectProps {
  onWalletChange: (address: string | null, provider: string | null) => void;
  currentAddress?: string | null;
  currentProvider?: string | null;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onWalletChange,
  currentAddress,
  currentProvider
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentAddress) {
      loadBalance();
    }
  }, [currentAddress]);

  const loadBalance = async () => {
    if (!currentAddress) return;
    
    setIsLoadingBalance(true);
    try {
      const accountBalance = await getAccountBalance(currentAddress);
      setBalance(accountBalance);
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const wallet = await connectWallet();
      if (wallet) {
        onWalletChange(wallet.address, wallet.provider);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      onWalletChange(null, null);
      setBalance(0);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleCreateDemo = () => {
    const demoAccount = createDemoAccount();
    onWalletChange(demoAccount.addr, 'Demo Account');
  };

  const copyAddress = async () => {
    if (currentAddress) {
      try {
        await navigator.clipboard.writeText(currentAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying address:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (currentAddress) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Wallet Connected</h3>
              <p className="text-sm text-slate-600">{currentProvider}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-emerald-600 font-medium">Connected</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Address</span>
              <button
                onClick={copyAddress}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-sm text-slate-900 break-all">
              {showDetails ? currentAddress : formatAddress(currentAddress)}
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
            >
              {showDetails ? 'Show less' : 'Show full address'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Balance</span>
              <button
                onClick={loadBalance}
                disabled={isLoadingBalance}
                className="text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoadingBalance ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-sm">Refresh</span>
                )}
              </button>
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {formatAlgoAmount(balance)}
            </div>
            {balance < 100000 && ( // Less than 0.1 ALGO
              <div className="mt-2 text-xs text-amber-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>Low balance - fund account to vote on blockchain</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={`https://testnet.algoexplorer.io/address/${currentAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on Explorer</span>
            </a>
            <button
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-700 transition-colors text-sm"
            >
              Disconnect
            </button>
          </div>
        </div>

        {currentProvider === 'Demo Account' && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-amber-800 text-sm">
                <p className="font-medium">Demo Account</p>
                <p>Fund this account at the TestNet faucet to enable blockchain voting.</p>
                <a
                  href="https://testnet.algoexplorer.io/dispenser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 underline hover:text-amber-900"
                >
                  Get TestNet ALGOs →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Connect Algorand Wallet</h3>
        <p className="text-slate-600 mb-6">
          Connect your wallet to record votes on the Algorand blockchain for transparency and immutability.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>

          <div className="text-center text-sm text-slate-500">
            <span>or</span>
          </div>

          <button
            onClick={handleCreateDemo}
            className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Shield className="h-5 w-5" />
            <span>Create Demo Account</span>
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-500 space-y-2">
          <p>Supported wallets: Pera Wallet, Defly, or Demo Account</p>
          <p>Votes are recorded on Algorand TestNet for demonstration</p>
        </div>
      </div>
    </div>
  );
};