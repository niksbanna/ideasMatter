import React, { useState } from 'react';
import { X, Flag, Send, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { submitReport } from '../services/reports';
import { isAuthenticated } from '../services/auth';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  ideaTitle: string;
  onAuthRequired?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  ideaId,
  ideaTitle,
  onAuthRequired
}) => {
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const reportReasons = [
    'Inappropriate or offensive content',
    'Spam or promotional content',
    'Harassment or personal attacks',
    'Misinformation or false claims',
    'Hate speech or discrimination',
    'Violence or threats',
    'Copyright or intellectual property violation',
    'Other (please specify below)'
  ];

  const handleReasonClick = (reason: string) => {
    if (reportText.includes(reason)) {
      // Remove if already selected
      setReportText(reportText.replace(reason, '').trim());
    } else {
      // Add to existing text
      const newText = reportText ? `${reportText}\n${reason}` : reason;
      setReportText(newText);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportText.trim()) return;

    // Check authentication
    if (!isAuthenticated()) {
      onAuthRequired?.();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await submitReport(ideaId, reportText.trim());
      setSubmitStatus('success');
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setReportText('');
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit report');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReportText('');
      setSubmitStatus('idle');
      setErrorMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Flag className="h-6 w-6 text-red-600" />
            <h3 className="text-xl font-bold text-slate-900">Report Content</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Report Submitted</h4>
              <p className="text-slate-600 mb-4">
                Thank you for helping keep our community safe. We'll review this report and take appropriate action.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Our AI moderation system will automatically review the content and may take immediate action if necessary.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-2">Reporting:</h4>
                <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg line-clamp-2">
                  "{ideaTitle}"
                </p>
              </div>

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-900">Submission Failed</h4>
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Why are you reporting this content?
                  </label>
                  
                  <div className="space-y-2 mb-4">
                    {reportReasons.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => handleReasonClick(reason)}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                          reportText.includes(reason)
                            ? 'border-red-300 bg-red-50 text-red-800'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        disabled={isSubmitting}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="reportText" className="block text-sm font-semibold text-slate-700 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    id="reportText"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Please provide any additional context about why you're reporting this content..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    disabled={isSubmitting}
                  />
                  <div className="text-right text-sm text-slate-500 mt-1">
                    {reportText.length}/500 characters
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-amber-800 text-sm">
                      <p className="font-medium mb-1">Important:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• False reports may result in account restrictions</li>
                        <li>• Reports are reviewed by both AI and human moderators</li>
                        <li>• Serious violations may result in immediate content removal</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !reportText.trim()}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting Report...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};