import React, { useState } from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Globe, 
  Terminal, 
  Layers, 
  Sparkles,
  Laptop
} from 'lucide-react';

export const GoogleSitesEmbedModal: React.FC = () => {
  const { 
    isGoogleSitesGuideOpen, 
    setIsGoogleSitesGuideOpen,
    isEmbedMode,
    setIsEmbedMode
  } = useRooms();

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isGoogleSitesGuideOpen) return null;

  // Compute current URL
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app-domain.com';
  const embedUrl = `${currentUrl}?embed=true`;
  const iframeSnippet = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="780" 
  style="border: 0; border-radius: 8px; width: 100%; min-height: 750px;" 
  title="NECN CampusPath Room Finder"
  loading="lazy"
></iframe>`;

  const copyIframe = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopiedIframe(true);
    setTimeout(() => setCopiedIframe(false), 2000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(embedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsGoogleSitesGuideOpen(false)} 
        aria-hidden="true" 
      />

      <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-[#0B2545]">
                Google Sites Embed & Deployment Guide
              </h2>
              <p className="text-xs text-slate-500">
                How to test, deploy, and seamlessly connect this module to your NECN CampusPath website
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGoogleSitesGuideOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700">
          
          {/* Quick Embed Switcher */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-blue-950 text-sm">
                Embed-Optimized Mode
              </div>
              <p className="text-xs text-blue-800">
                Enables a streamlined, minimal header specifically designed for iframe integration.
              </p>
            </div>
            <button
              onClick={() => {
                setIsEmbedMode(!isEmbedMode);
                setIsGoogleSitesGuideOpen(false);
              }}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-medium rounded-lg text-xs transition-colors shrink-0"
            >
              {isEmbedMode ? 'Disable Embed Mode' : 'Preview Embed Mode'}
            </button>
          </div>

          {/* STEP 1: How to embed in Google Sites */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0B2545] text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <span>Embedding into your Google Sites Webpage</span>
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs leading-relaxed">
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
                <li>Open your <strong>Google Sites</strong> editor for your NECN CampusPath site.</li>
                <li>On the right sidebar, click the <strong>Insert</strong> tab and select <strong>Embed</strong>.</li>
                <li>Choose either <strong>"By URL"</strong> or <strong>"Embed code"</strong>:</li>
              </ol>

              {/* URL Option */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Option A: Embed by URL (Recommended)
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={embedUrl}
                    className="flex-1 p-2 font-mono text-[11px] bg-white border border-slate-300 rounded-lg text-slate-800 select-all"
                  />
                  <button
                    onClick={copyUrl}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>

              {/* Iframe Option */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Option B: Embed Code HTML (Iframe snippet)
                </div>
                <div className="relative">
                  <pre className="p-3 bg-slate-50 border border-slate-300 text-slate-800 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {iframeSnippet}
                  </pre>
                  <button
                    onClick={copyIframe}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] transition-colors"
                  >
                    {copiedIframe ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIframe ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                * After placing on your Google Sites page, drag the container handles to make the frame wide and tall (~780px) so the search and results fit comfortably without excessive inner scrollbars.
              </p>
            </div>
          </div>

          {/* STEP 2: Local Testing */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0B2545] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <span>How to Test Locally</span>
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <p className="text-slate-700">
                Run standard commands in your project terminal:
              </p>
              <div className="space-y-2">
                <div className="p-2.5 bg-white border border-slate-300 text-slate-800 rounded font-mono text-[11px] flex items-center justify-between">
                  <code>npm run dev</code>
                  <span className="text-slate-500 font-sans text-[10px]">Start development server on port 3000</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-300 text-slate-800 rounded font-mono text-[11px] flex items-center justify-between">
                  <code>npm run build</code>
                  <span className="text-slate-500 font-sans text-[10px]">Compile production build to /dist</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-300 text-slate-800 rounded font-mono text-[11px] flex items-center justify-between">
                  <code>npm run preview</code>
                  <span className="text-slate-500 font-sans text-[10px]">Preview production build locally</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Production Deployment Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0B2545] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <span>Deploying to Free / Production Hosting</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-[#0B2545]">Vercel / Netlify</div>
                <p className="text-slate-600 text-[11px]">
                  Push this repository to GitHub, connect to Vercel/Netlify. Build command: <code className="font-mono text-slate-800">npm run build</code>, output directory: <code className="font-mono text-slate-800">dist</code>.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-[#0B2545]">Firebase Hosting / GitHub Pages</div>
                <p className="text-slate-600 text-[11px]">
                  Deploy the static <code className="font-mono text-slate-800">dist/</code> folder directly with free SSL and custom domain support (e.g. <code className="font-mono text-slate-800">path.necn.ac.in</code>).
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={() => setIsGoogleSitesGuideOpen(false)}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
