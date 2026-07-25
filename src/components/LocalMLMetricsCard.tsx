import React from 'react';
import { Cpu, BookOpen, Hash, Palette, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export interface ReadabilityResult {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  interpretation: string;
  isDegenerate?: boolean;
}

export interface ColorContrastResult {
  dominantColors: string[];
  minContrastRatio: number;
  maxContrastRatio: number;
  wcagAAPass: boolean;
  note: string;
}

export interface LocalMLMetrics {
  readability?: ReadabilityResult | null;
  keywords?: string[];
  colorContrast?: ColorContrastResult | null;
}

interface LocalMLMetricsCardProps {
  metrics?: LocalMLMetrics | null;
}

function ReadabilityBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70 ? 'bg-emerald-500' : clamped >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export const LocalMLMetricsCard: React.FC<LocalMLMetricsCardProps> = ({ metrics }) => {
  if (!metrics || (!metrics.readability && (!metrics.keywords || metrics.keywords.length === 0) && !metrics.colorContrast)) {
    return null;
  }

  const { readability, keywords, colorContrast } = metrics;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border-2 border-slate-200 space-y-6">
      {/* Header — visually distinct from LLM sections */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-700 text-slate-100 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">Independently Computed Metrics</h3>
              <span className="bg-slate-700 text-slate-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Deterministic · No AI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculated directly from your content and screenshot using local NLP/ML algorithms. These are mathematical facts, not AI-generated judgments.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Readability ── */}
        {readability && (
          <div className="space-y-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Text Readability Scores</h4>
              </div>
              {readability.isDegenerate && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Extraction Warning
                </span>
              )}
            </div>

            {/* Flesch Reading Ease */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Flesch Reading Ease</span>
                <span className={`text-sm font-extrabold ${readability.isDegenerate ? 'text-amber-600' : readability.fleschReadingEase >= 70 ? 'text-emerald-600' : readability.fleschReadingEase >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                  {readability.isDegenerate ? 'N/A' : `${readability.fleschReadingEase}/100`}
                </span>
              </div>
              {!readability.isDegenerate && <ReadabilityBar score={readability.fleschReadingEase} />}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Grade Level</div>
                <div className="text-xl font-extrabold text-slate-900">
                  {readability.isDegenerate ? '—' : readability.fleschKincaidGrade}
                </div>
                <div className="text-[10px] text-slate-400">Flesch-Kincaid</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Fog Index</div>
                <div className="text-xl font-extrabold text-slate-900">
                  {readability.isDegenerate ? '—' : readability.gunningFog}
                </div>
                <div className="text-[10px] text-slate-400">Gunning Fog</div>
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex items-start space-x-2 ${readability.isDegenerate ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${readability.isDegenerate ? 'text-amber-600' : 'text-slate-500'}`} />
              <p className="text-xs leading-relaxed">{readability.interpretation}</p>
            </div>
          </div>
        )}

        {/* ── TF-IDF Keywords ── */}
        {keywords && keywords.length > 0 && (
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Hash className="w-5 h-5 text-slate-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">TF-IDF Extracted Keywords</h4>
            </div>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Top terms ranked by term frequency–inverse document frequency (TF-IDF) score. These reflect what your page actually emphasizes, grounding the LLM's SEO suggestions.
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-full border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Color Contrast ── */}
        {colorContrast && (
          <div className="md:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Palette-Level Color Contrast
                </h4>
              </div>
              {colorContrast.wcagAAPass ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  WCAG AA Pass
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  WCAG AA Fail
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center col-span-1">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Min Ratio</div>
                <div className="text-2xl font-extrabold text-slate-900">{colorContrast.minContrastRatio}:1</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center col-span-1">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Max Ratio</div>
                <div className={`text-2xl font-extrabold ${colorContrast.maxContrastRatio >= 4.5 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {colorContrast.maxContrastRatio}:1
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2 flex flex-col justify-center">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Dominant Palette Colors</div>
                <div className="flex items-center space-x-2">
                  {colorContrast.dominantColors.map((hex, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1">
                      <div
                        className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                      <span className="text-[9px] font-mono text-slate-500">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">{colorContrast.note}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
