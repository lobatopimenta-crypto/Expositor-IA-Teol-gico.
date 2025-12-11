import React, { useState, useEffect, useRef } from 'react';
import InputForm from './components/InputForm';
import StudyViewer from './components/StudyViewer';
import { StudyRequest, StudyData, HistoryItem, Translation, Depth } from './types';
import { generateStudy } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentStudy, setCurrentStudy] = useState<StudyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Use a ref to prevent double-firing in StrictMode or ensuring it only runs once
  const hasCheckedUrl = useRef(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('exegesis_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Check URL parameters for shared studies on load
  useEffect(() => {
    if (hasCheckedUrl.current) return;
    hasCheckedUrl.current = true;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const trans = params.get('trans') as Translation;
    const depth = params.get('depth') as Depth;

    if (ref) {
      // Clear URL to clean up history without refreshing
      window.history.replaceState({}, '', window.location.pathname);
      
      handleCreateStudy({
        passage: decodeURIComponent(ref),
        translation: trans || 'NVI',
        depth: depth || 'detalhado'
      });
    }
  }, []);

  const addToHistory = (request: StudyRequest) => {
    const newItem: HistoryItem = { ...request, timestamp: Date.now() };
    
    setHistory(prev => {
      // Remove duplicates based on passage and translation
      const filtered = prev.filter(item => 
        !(item.passage === newItem.passage && item.translation === newItem.translation)
      );
      // Add new item to top, limit to 10
      const newHistory = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem('exegesis_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleCreateStudy = async (request: StudyRequest) => {
    setIsLoading(true);
    setError(null);
    
    // Save to history immediately
    addToHistory(request);

    try {
      const data = await generateStudy(request);
      setCurrentStudy(data);
    } catch (err: any) {
      console.error(err);
      setError("Ocorreu um erro ao gerar o estudo. Verifique sua chave de API ou tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStudy(null);
    setError(null);
  };

  // Environment check
  if (!process.env.API_KEY) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
            <AlertCircle /> Configuração Necessária
          </h2>
          <p className="text-stone-600 mb-4">
            A API Key do Google Gemini não foi encontrada.
          </p>
          <div className="bg-stone-100 p-4 rounded text-sm font-mono text-stone-700">
            process.env.API_KEY
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-stone-50 text-stone-900 font-sans relative">
      {/* Assinatura Celpf Fixa */}
      <div className="fixed bottom-2 right-4 z-[100] pointer-events-none select-none opacity-40 mix-blend-multiply">
        <span className="font-serif italic text-[10px] text-stone-400 tracking-widest">Celpf</span>
      </div>

      {currentStudy ? (
        <StudyViewer data={currentStudy} onBack={handleBack} />
      ) : (
        <div className="h-full overflow-y-auto flex flex-col">
          <main className="flex-1 flex items-center justify-center p-4 py-12">
            <div className="w-full">
                <InputForm 
                  onSubmit={handleCreateStudy} 
                  isLoading={isLoading} 
                  history={history}
                  onHistorySelect={(item) => handleCreateStudy(item)}
                />
                
                {error && (
                    <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3 shadow-sm animate-fadeIn">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>
          </main>
          
          <footer className="py-8 text-center text-stone-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Exegesis AI. Powered by Gemini.</p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;