
import React, { useState, useRef } from 'react';
import { generateDeck } from './services/geminiService';
import { Deck, ProcessingStatus, ThemeType } from './types';
import { Button } from './components/Button';
import { SlidePreview } from './components/SlidePreview';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [fileData, setFileData] = useState<{ data: string, mimeType: string } | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({ step: '', loading: false });
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFileData({
          data: ev.target?.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!inputText && !fileData) return;
    
    setStatus({ step: 'Architecting your deck...', loading: true });
    try {
      const result = await generateDeck(inputText, fileData || undefined);
      setDeck(result);
      setCurrentSlideIndex(0);
      setStatus({ step: 'Complete', loading: false });
    } catch (error: any) {
      setStatus({ step: 'Failed', loading: false, error: error.message });
    }
  };

  const handleReset = () => {
    setDeck(null);
    setInputText('');
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">X</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">XARAXIA</h1>
              <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">Slide Architect</p>
            </div>
          </div>
          {deck && (
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.print()}>Export PDF</Button>
              <Button onClick={handleReset}>New Project</Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!deck ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Turn raw data into professional decks</h2>
              <p className="text-lg text-slate-600">Upload a document, paste text, or provide an image. Our AI handles the structure, visuals, and flow.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Input Content</label>
                  <textarea
                    className="w-full h-64 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                    placeholder="Paste your report, meeting notes, or article here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-grow h-px bg-slate-100"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                  <div className="flex-grow h-px bg-slate-100"></div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Attach Resource (Image/PDF)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${fileData ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
                  >
                    {fileData ? (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="font-medium text-indigo-700">File Ready</p>
                        <p className="text-xs text-indigo-400 mt-1">Click to change resource</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="font-medium text-slate-600">Select Image or PDF Document</p>
                        <p className="text-sm text-slate-400 mt-1">Gemini will analyze the content directly</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-8 py-6 flex flex-col items-center">
                <Button 
                  onClick={handleProcess} 
                  isLoading={status.loading}
                  disabled={!inputText && !fileData}
                  className="w-full max-w-sm"
                >
                  {status.loading ? status.step : 'Architect Slide Deck'}
                </Button>
                {status.error && (
                  <p className="mt-4 text-red-500 text-sm font-medium">Error: {status.error}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Slide Navigation / Thumbnails */}
            <aside className="lg:col-span-3 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 no-print">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Slides</h3>
              {deck.slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative ${
                    currentSlideIndex === i 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400">{i + 1}</span>
                    <div className="flex-grow min-w-0">
                      <p className={`text-sm font-bold truncate ${currentSlideIndex === i ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {s.slide_title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{s.layout_type}</p>
                    </div>
                  </div>
                </button>
              ))}
            </aside>

            {/* Main Stage */}
            <div className="lg:col-span-9 space-y-8">
              <div className="flex items-center justify-between no-print">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{deck.title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">{deck.theme} Theme</span>
                    <span className="text-sm text-slate-400">|</span>
                    <span className="text-sm text-slate-500 font-medium">{deck.slides.length} Professional Slides</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <Button 
                    variant="outline" 
                    disabled={currentSlideIndex === 0} 
                    onClick={() => setCurrentSlideIndex(i => i - 1)}
                   >
                     Prev
                   </Button>
                   <Button 
                    variant="outline" 
                    disabled={currentSlideIndex === deck.slides.length - 1} 
                    onClick={() => setCurrentSlideIndex(i => i + 1)}
                   >
                     Next
                   </Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="no-print">
                <SlidePreview 
                  slide={deck.slides[currentSlideIndex]} 
                  theme={deck.theme} 
                  index={currentSlideIndex} 
                />
              </div>

              {/* Presenter Notes Panel */}
              <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl no-print relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Presenter Notes</h4>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {deck.slides[currentSlideIndex].presenter_notes}
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Visual Strategy</h5>
                    <p className="text-sm text-slate-400 italic">"{deck.slides[currentSlideIndex].visual_suggestion}"</p>
                  </div>
                </div>
              </div>

              {/* Print View Container (Hidden except for printing) */}
              <div className="hidden print:block space-y-8">
                {deck.slides.map((slide, i) => (
                  <SlidePreview key={i} slide={slide} theme={deck.theme} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {!deck && (
        <footer className="py-12 border-t border-slate-200 mt-12 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-slate-400 text-sm font-medium">Powered by XARAXIA Architecture Core & Gemini Pro Vision</p>
            <div className="flex justify-center gap-8 mt-6">
              {['Corporate', 'Vibrant', 'Minimalist', 'Tech'].map(theme => (
                <div key={theme} className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                   <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{theme}</span>
                </div>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
