import React, { useState } from 'react';
import { Sparkles, FileText, Link, MessageSquare, AlertCircle, ArrowRight, Zap } from 'lucide-react';

interface DashboardPageProps {
  onReportGenerated: (report: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onReportGenerated }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'copy' | 'url' | 'description'>('copy');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim() || content.trim().length < 10) {
      setError('Please provide at least 10 characters of landing page content or product details.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: title.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze landing page. Please try again.');
      }

      onReportGenerated(data.report);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = () => {
    setTitle('SaaS Analytics Landing Page');
    setContent(
      `SaaS Metrics Dashboard for Modern Founders.\nTrack MRR, Churn, CAC, and Customer LTV in real-time with zero engineering setup.\nSign up today for a 14-day free trial. No credit card required.\nFeatures include automated Stripe syncing, custom cohort analysis, and email alerts.\nTrusted by 2,000+ fast-growing tech companies.`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-navy-900 text-offwhite p-6 sm:p-8 rounded-2xl border border-navy-700 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 text-amber text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claude 3.5 Conversion Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Analyze Landing Page
          </h1>
          <p className="text-sm text-gray-300 mt-1 max-w-xl">
            Input landing page text, website URL context, or product offer details to receive an instant CRO score and optimization report.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSampleClick}
          className="shrink-0 text-xs font-semibold px-3.5 py-2 bg-navy-800 hover:bg-navy-700 text-amber border border-amber/30 rounded-lg transition-colors"
        >
          Load Sample Data
        </button>
      </div>

      {/* Input Panel */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-card space-y-6">
        {/* Input Mode Selectors */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setInputMode('copy')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'copy'
                ? 'bg-navy-900 text-offwhite'
                : 'bg-offwhite text-gray-600 hover:text-navy-900 border border-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber" />
            <span>Paste Page Copy</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'url'
                ? 'bg-navy-900 text-offwhite'
                : 'bg-offwhite text-gray-600 hover:text-navy-900 border border-gray-200'
            }`}
          >
            <Link className="w-4 h-4 text-amber" />
            <span>Paste Page URL</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('description')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'description'
                ? 'bg-navy-900 text-offwhite'
                : 'bg-offwhite text-gray-600 hover:text-navy-900 border border-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber" />
            <span>Product Description</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
              Report Title <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acme SaaS Hero Page V2"
              className="w-full px-4 py-2.5 bg-offwhite border border-gray-300 rounded-xl text-sm text-navy-900 focus:ring-2 focus:ring-amber focus:border-amber transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
              {inputMode === 'url'
                ? 'Landing Page URL or Domain Context'
                : inputMode === 'description'
                ? 'Product Offer & Target Audience Description'
                : 'Landing Page Text / Headlines / CTAs'}
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                inputMode === 'url'
                  ? 'https://mywebsite.com (Paste page URL or key section text)'
                  : inputMode === 'description'
                  ? 'We build automated SEO software for B2B founders. Our offer is $49/mo unlimited articles with a 7-day free trial...'
                  : 'Headline: Turn 30% More Visitors Into Customers\nSubheadline: AI landing page audits delivered in seconds.\nCTA Button: Get Started Free'
              }
              className="w-full p-4 bg-offwhite border border-gray-300 rounded-xl text-sm font-sans text-navy-900 focus:ring-2 focus:ring-amber focus:border-amber transition-all leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              {content.length} characters
            </span>

            <button
              type="submit"
              disabled={loading || content.trim().length < 10}
              className="px-8 py-3.5 bg-amber hover:bg-amber-hover text-navy-900 font-bold text-sm rounded-xl shadow-amber-glow transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full" />
                  <span>Analyzing Page with Claude...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Analyze My Page</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Skeleton Indicator */}
      {loading && (
        <div className="glass-card rounded-2xl p-8 border border-amber/30 space-y-6 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-amber rounded-full animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy-900">Claude AI is evaluating your landing page...</h3>
              <p className="text-xs text-gray-500">Checking copy clarity, CTA placement, WCAG accessibility, and SEO metadata.</p>
            </div>
          </div>
          <div className="h-2 bg-amber/20 rounded-full overflow-hidden">
            <div className="h-full bg-amber w-2/3 animate-shimmer" />
          </div>
        </div>
      )}
    </div>
  );
};
