import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Sparkles, Clock, ArrowRight, AlertCircle, Quote, Filter, X, Info } from 'lucide-react';
import { StudyRequest, Translation, Depth, HistoryItem } from '../types';

interface InputFormProps {
  onSubmit: (data: StudyRequest) => void;
  isLoading: boolean;
  history: HistoryItem[];
  onHistorySelect: (item: StudyRequest) => void;
}

// Simple internal database of verses for the "Daily Verse" feature
const DAILY_VERSES = [
  { text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
  { text: "Porque a palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes.", ref: "Hebreus 4:12" },
  { text: "Seca-se a erva, e cai a flor, porém a palavra de nosso Deus subsiste eternamente.", ref: "Isaías 40:8" },
  { text: "Toda a Escritura é divinamente inspirada, e proveitosa para ensinar, para redargüir, para corrigir, para instruir em justiça.", ref: "2 Timóteo 3:16" },
  { text: "Não se aparte da tua boca o livro desta lei; antes medita nele dia e noite.", ref: "Josué 1:8" },
  { text: "Examinais as Escrituras, porque vós cuidais ter nelas a vida eterna, e são elas que de mim testificam.", ref: "João 5:39" },
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, history, onHistorySelect }) => {
  const [passage, setPassage] = useState('');
  const [translation, setTranslation] = useState<Translation>('NVI');
  const [depth, setDepth] = useState<Depth>('detalhado');
  const [verse, setVerse] = useState(DAILY_VERSES[0]);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // History Filter State
  const [historyFilter, setHistoryFilter] = useState('');

  useEffect(() => {
    // Pick a random verse on mount
    const randomIndex = Math.floor(Math.random() * DAILY_VERSES.length);
    setVerse(DAILY_VERSES[randomIndex]);
  }, []);

  // Validation logic
  const validatePassage = (input: string): boolean => {
    if (!input.trim()) return false;
    
    // Regex explanation:
    // ^\s*                  : Start optional space
    // (?:\d\s*)?            : Optional number at start (e.g. "1 " in "1 Jo")
    // [a-zA-ZÀ-ÿ\.]+        : Book name (letters, accents, dots)
    // \s+                   : Mandatory space
    // \d+                   : Chapter number
    // (?:[:\.]\d+(?:-\d+)?)?: Optional Verse part (e.g. :1, :1-10, .1)
    // \s*$                  : End optional space
    const bibleRegex = /^\s*(?:\d\s*)?[a-zA-ZÀ-ÿ\.]+\s+\d+(?:[:\.]\d+(?:-\d+)?)?\s*$/;

    // A permissive check to ensure it at least looks like "Book Number"
    if (!bibleRegex.test(input)) {
        setValidationError("Formato inválido. Use: Livro Capítulo:Versículo (ex: Mateus 3:11, 1 Jo 1:9)");
        return false;
    }
    
    setValidationError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!passage.trim()) {
        setValidationError("Por favor, insira uma passagem bíblica.");
        return;
    }

    if (!validatePassage(passage)) {
        return;
    }

    onSubmit({ passage, translation, depth });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassage(e.target.value);
    if (validationError) setValidationError(null); // Clear error on type
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setPassage(item.passage);
    setTranslation(item.translation);
    setDepth(item.depth);
    setValidationError(null);
    onHistorySelect(item);
  };

  // Filter History Logic
  const filteredHistory = history.filter(item => {
    const search = historyFilter.toLowerCase();
    return (
        item.passage.toLowerCase().includes(search) ||
        item.translation.toLowerCase().includes(search)
    );
  });

  return (
    <div className="w-full max-w-3xl mx-auto font-sans">
      {/* Header Minimalista e Elegante */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-2 shadow-sm">
          <BookOpen className="w-8 h-8 text-stone-700" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">Exegesis AI</h1>
        <p className="text-stone-500 max-w-lg mx-auto font-light text-lg font-sans">
          Assistente de teologia para análise bíblica sistemática, léxica e histórica.
        </p>
      </div>

      {/* Versículo do Dia - Card Elegante */}
      <div className="mb-10 mx-4 md:mx-0 relative">
        <div className="bg-stone-800 rounded-2xl p-6 md:p-8 text-center shadow-xl shadow-stone-900/10 relative overflow-hidden">
             {/* Decorative Quotes */}
            <Quote className="absolute top-4 left-4 w-10 h-10 text-stone-700 opacity-50 rotate-180" />
            <div className="relative z-10">
                <p className="text-stone-200 font-serif text-lg md:text-xl italic leading-relaxed mb-4 text-justify hyphens-auto md:text-center">
                    "{verse.text}"
                </p>
                <div className="inline-block px-3 py-1 border border-stone-600 rounded-full text-stone-400 text-xs font-semibold tracking-wider uppercase font-sans">
                    {verse.ref}
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mb-4"></div>
            <p className="text-stone-600 font-medium animate-pulse font-sans">Analisando textos sagrados...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1 font-sans">
              Passagem Bíblica
            </label>
            <div className="relative group">
              <input
                type="text"
                value={passage}
                onChange={handleInputChange}
                onBlur={() => passage && validatePassage(passage)}
                placeholder="Ex: Mateus 3:11, Romanos 8:28..."
                className={`w-full pl-12 pr-4 py-4 bg-stone-50 border rounded-xl focus:ring-2 focus:bg-white transition-all text-xl font-sans placeholder-stone-400 text-stone-800 shadow-inner
                    ${validationError 
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30' 
                        : 'border-stone-200 focus:ring-stone-400 focus:border-stone-400'
                    }`}
                disabled={isLoading}
              />
              <Search className={`absolute left-4 top-5 w-6 h-6 transition-colors ${validationError ? 'text-red-400' : 'text-stone-400 group-focus-within:text-stone-700'}`} />
            </div>
            {validationError && (
                <div className="flex items-center gap-2 mt-2 ml-1 text-red-500 text-sm animate-fadeIn font-sans">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1 font-sans">
                Versão / Tradução
              </label>
              <div className="relative">
                <select
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value as Translation)}
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:border-stone-400 focus:bg-white appearance-none text-stone-700 font-medium cursor-pointer hover:bg-stone-100 transition-colors font-sans"
                  disabled={isLoading}
                >
                  <optgroup label="Português">
                    <option value="NVI">Nova Versão Internacional (NVI)</option>
                    <option value="NVT">Nova Versão Transformadora (NVT)</option>
                    <option value="KJA">King James Atualizada (KJA)</option>
                    <option value="ARC">Almeida Revista e Corrigida (ARC)</option>
                    <option value="ACF">Almeida Corrigida Fiel (ACF)</option>
                  </optgroup>
                  <optgroup label="Inglês">
                    <option value="NIV">New International Version (NIV)</option>
                    <option value="ESV">English Standard Version (ESV)</option>
                    <option value="KJV">King James Version (KJV)</option>
                  </optgroup>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <ArrowRight className="w-4 h-4 text-stone-400 rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 ml-1 font-sans">
                Profundidade do Estudo
                
                {/* Tooltip Info */}
                <div className="relative group ml-1.5 cursor-help">
                    <Info className="w-3.5 h-3.5 text-stone-400 hover:text-stone-600 transition-colors" />
                    
                    {/* Tooltip Content */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-stone-800 text-stone-200 text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-relaxed border border-stone-700 font-sans">
                        <div className="space-y-2">
                            <p><span className="text-white font-bold">Rápido:</span> Devocional, conciso e inspirador. Ideal para leitura diária.</p>
                            <p><span className="text-white font-bold">Detalhado:</span> Equilíbrio entre contexto histórico e aplicação prática. Ótimo para grupos.</p>
                            <p><span className="text-white font-bold">Acadêmico:</span> Exegese técnica, línguas originais e debate teológico profundo.</p>
                            <p><span className="text-white font-bold">Sermão:</span> Gera um esboço homilético completo, estruturado para pregação.</p>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-stone-800"></div>
                    </div>
                </div>
              </label>
              <div className="relative">
                <select
                  value={depth}
                  onChange={(e) => setDepth(e.target.value as Depth)}
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:border-stone-400 focus:bg-white appearance-none text-stone-700 font-medium cursor-pointer hover:bg-stone-100 transition-colors font-sans"
                  disabled={isLoading}
                >
                  <option value="rapido">Rápido (Devocional & Breve)</option>
                  <option value="detalhado">Detalhado (Estudo & Grupo)</option>
                  <option value="academico">Acadêmico (Exegese & Grego)</option>
                  <option value="sermao">Sermão Expositivo (Pregação Pronta)</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <ArrowRight className="w-4 h-4 text-stone-400 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 font-semibold text-lg transition-all transform hover:-translate-y-0.5 shadow-lg font-sans ${
              isLoading
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                : 'bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-stone-900/20'
            }`}
          >
             <Sparkles className="w-5 h-5" />
             <span>Gerar Estudo</span>
          </button>
        </form>
      </div>

      {/* Histórico Recente */}
      {history.length > 0 && (
        <div className="mt-12 animate-fadeIn">
            {/* Header com Filtro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 px-2">
                <div className="flex items-center gap-2 text-stone-400">
                    <Clock className="w-4 h-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-sans">Histórico Recente</h3>
                </div>
                
                {/* Search / Filter Input */}
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Filtrar histórico..."
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value)}
                        className="pl-8 pr-8 py-1.5 bg-stone-100 border-none rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-stone-300 focus:bg-white transition-all w-full sm:w-48 font-sans"
                    />
                    <Filter className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
                    {historyFilter && (
                        <button 
                            onClick={() => setHistoryFilter('')}
                            className="absolute right-2 top-2 text-stone-400 hover:text-stone-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredHistory.length > 0 ? (
                filteredHistory.map((item, index) => (
                <button
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    disabled={isLoading}
                    className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-xl hover:border-stone-300 hover:shadow-md transition-all text-left group"
                >
                    <div>
                    <div className="font-serif font-bold text-stone-800 text-lg">{item.passage}</div>
                    <div className="text-xs text-stone-500 mt-1 flex gap-2 font-sans">
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">{item.translation}</span>
                        <span className="capitalize">{item.depth === 'sermao' ? 'Sermão' : item.depth}</span>
                    </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
                </button>
                ))
            ) : (
                <div className="col-span-2 text-center py-6 text-stone-400 italic bg-stone-50 rounded-xl border border-dashed border-stone-200 font-sans">
                    Nenhum estudo encontrado para "{historyFilter}"
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputForm;