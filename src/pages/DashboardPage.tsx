import React, { useState } from 'react';
import { Sparkles, FileText, Link, MessageSquare, AlertCircle, Zap, Camera, Eye, Upload, X } from 'lucide-react';

interface DashboardPageProps {
  onReportGenerated: (report: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onReportGenerated }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'screenshot' | 'vision' | 'saving'>('screenshot');
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'url' | 'copy' | 'description'>('url');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const submitContent = inputMode === 'url' ? (urlInput || content) : content;

    if (!submitContent.trim() || submitContent.trim().length < 10) {
      setError('Please provide a valid URL or at least 10 characters of landing page content.');
      return;
    }

    setLoading(true);
    setLoadingStage('screenshot');

    try {
      // Simulate stage updates for nice feedback
      const timer = setTimeout(() => {
        setLoadingStage('vision');
      }, 3500);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: submitContent,
          title: title.trim() || undefined,
          url: urlInput.trim() || undefined,
          imageBase64: imageBase64 || undefined,
        }),
      });

      clearTimeout(timer);
      setLoadingStage('saving');

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
    setInputMode('url');
    setTitle('LandingIQ Live Showcase Page');
    setUrlInput('https://stripe.com');
    setContent('Stripe — Financial Infrastructure for the Internet. Millions of businesses of all sizes—from startups to large enterprises—use Stripe software and APIs to accept payments, send payouts, and manage their businesses online.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-navy-900 text-offwhite p-6 sm:p-8 rounded-2xl border border-navy-700 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 text-amber text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal AI + Playwright Vision Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white flex items-center gap-2">
            <span>Analyze Landing Page</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber/20 text-amber font-mono border border-amber/40">Vision AI Enabled</span>
          </h1>
          <p className="text-sm text-gray-300 mt-1 max-w-xl">
            Input a website URL for automated Playwright screenshot capture, or paste page copy to get instant multimodal visual UX & CRO scores.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSampleClick}
          className="shrink-0 text-xs font-semibold px-3.5 py-2 bg-navy-800 hover:bg-navy-700 text-amber border border-amber/30 rounded-lg transition-colors flex items-center space-x-1.5"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Load Sample URL</span>
        </button>
      </div>

      {/* Input Panel */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-card space-y-6">
        {/* Input Mode Selectors */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'url'
                ? 'bg-navy-900 text-offwhite ring-2 ring-amber/50'
                : 'bg-offwhite text-gray-600 hover:text-navy-900 border border-gray-200'
            }`}
          >
            <Camera className="w-4 h-4 text-amber" />
            <span>Playwright Vision URL Audit</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber text-navy-900 font-extrabold uppercase">New</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('copy')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'copy'
                ? 'bg-navy-900 text-offwhite'
                : 'bg-offwhite text-gray-600 hover:text-navy-900 border border-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber" />
            <span>Paste Copy / Text</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('description')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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

          {inputMode === 'url' && (
            <div className="p-4 bg-navy-900/5 rounded-xl border border-amber/30 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
                Landing Page URL for Automated Playwright Vision Capture
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-amber absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required={inputMode === 'url'}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com or myproduct.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-navy-900 font-mono focus:ring-2 focus:ring-amber focus:border-amber transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber shrink-0" />
                <span>Playwright will launch a headless Chromium browser to capture a high-res screenshot and send it to Multimodal AI Vision.</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
              {inputMode === 'url'
                ? 'Additional Page Copy or Context (Optional)'
                : inputMode === 'description'
                ? 'Product Offer & Target Audience Description'
                : 'Landing Page Text / Headlines / CTAs'}
            </label>
            <textarea
              rows={inputMode === 'url' ? 4 : 7}
              required={inputMode !== 'url'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                inputMode === 'url'
                  ? 'Optionally add extra hero section text or value props here...'
                  : inputMode === 'description'
                  ? 'We build automated SEO software for B2B founders. Our offer is $49/mo unlimited articles with a 7-day free trial...'
                  : 'Headline: Turn 30% More Visitors Into Customers\nSubheadline: AI landing page audits delivered in seconds.\nCTA Button: Get Started Free'
              }
              className="w-full p-4 bg-offwhite border border-gray-300 rounded-xl text-sm font-sans text-navy-900 focus:ring-2 focus:ring-amber focus:border-amber transition-all leading-relaxed"
            />
          </div>

          {/* Screenshot File Upload Option */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
              Or Upload Screenshot Image <span className="font-normal text-gray-400">(Optional PNG/JPG)</span>
            </label>
            {imageBase64 ? (
              <div className="relative inline-block group">
                <img
                  src={imageBase64}
                  alt="Uploaded preview"
                  className="w-48 h-28 object-cover rounded-xl border-2 border-amber shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setImageBase64(null)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center space-x-2 px-4 py-2.5 bg-offwhite border border-dashed border-gray-300 rounded-xl text-xs text-gray-600 cursor-pointer hover:border-amber transition-colors w-max">
                <Upload className="w-4 h-4 text-amber" />
                <span>Upload Custom Page Screenshot</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">
              {inputMode === 'url' && urlInput ? `Target: ${urlInput}` : `${content.length} characters`}
            </span>

            <button
              type="submit"
              disabled={loading || (inputMode !== 'url' && content.trim().length < 10) || (inputMode === 'url' && !urlInput.trim() && content.trim().length < 10)}
              className="px-8 py-3.5 bg-amber hover:bg-amber-hover text-navy-900 font-bold text-sm rounded-xl shadow-amber-glow transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full" />
                  <span>
                    {loadingStage === 'screenshot'
                      ? 'Capturing Playwright Screenshot...'
                      : loadingStage === 'vision'
                      ? 'Analyzing Vision AI & Copy metrics...'
                      : 'Finalizing CRO Audit Report...'}
                  </span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 fill-current" />
                  <span>Run Vision & Copy Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Skeleton Indicator */}
      {loading && (
        <div className="glass-card rounded-2xl p-8 border border-amber/40 space-y-6 animate-pulse bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-navy-900 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-bold text-navy-900">
                {loadingStage === 'screenshot'
                  ? 'Headless Playwright Chromium browser capturing page screenshot...'
                  : 'Multimodal AI processing visual layout & text CRO metrics...'}
              </p>
              <p className="text-xs text-gray-500">Evaluating contrast, above-the-fold clarity, typography, and CTA visual hierarchy</p>
            </div>
          </div>
          <div className="h-32 bg-gray-100 rounded-xl w-full" />
        </div>
      )}
    </div>
  );
};
