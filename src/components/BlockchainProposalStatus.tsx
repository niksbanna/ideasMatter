import React from 'react';
import { ExternalLink, CheckCircle, Clock, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { getTransactionExplorerUrl } from '../services/algorand';
import { getNodelyExplorerUrl, isNodelyConfigured } from '../services/nodelyAlgorand';

interface BlockchainProposalStatusProps {
  isOnChain: boolean;
  txId?: string;
  confirmedRound?: number;
  timestamp?: number;
  isLoading?: boolean;
  error?: string;
}

export const BlockchainProposalStatus: React.FC<BlockchainProposalStatusProps> = ({
  isOnChain,
  txId,
  confirmedRound,
  timestamp,
  isLoading,
  error
}) => {
  const getExplorerUrl = (txId: string) => {
    return isNodelyConfigured() ? getNodelyExplorerUrl(txId) : getTransactionExplorerUrl(txId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Recording proposal on blockchain...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>Blockchain recording failed: {error}</span>
      </div>
    );
  }

  if (isOnChain && txId) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">Proposal Recorded on Blockchain</span>
            </div>
            <div className="space-y-1 text-xs text-emerald-700">
              <div className="flex items-center justify-between">
                <span>Transaction ID:</span>
                <code className="font-mono bg-emerald-100 px-1 rounded">
                  {txId.slice(0, 8)}...{txId.slice(-8)}
                </code>
              </div>
              {confirmedRound && (
                <div className="flex items-center justify-between">
                  <span>Block:</span>
                  <span className="font-medium">#{confirmedRound}</span>
                </div>
              )}
              {timestamp && (
                <div className="flex items-center justify-between">
                  <span>Recorded:</span>
                  <span>{new Date(timestamp).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <a
                href={getExplorerUrl(txId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">View on Algorand Explorer</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-slate-500">
      <Clock className="h-4 w-4" />
      <span>Proposal recorded locally only</span>
    </div>
  );
};