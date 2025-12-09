import React, { useState, useRef, useEffect } from 'react';
import { StudyData } from '../types';
import { 
  BookOpen, 
  History, 
  Languages, 
  Users, 
  Lightbulb, 
  HelpCircle, 
  Book, 
  Download,
  Presentation,
  ChevronLeft,
  FileText,
  FileType2,
  File,
  Menu,
  Mic2,
  GitMerge,
  Share2,
  Check
} from 'lucide-react';
import { exportToMarkdown, exportToPPTX, exportToDoc, exportToPDF } from '../services/exportService';

interface StudyViewerProps {
  data: StudyData;
  onBack: () => void;
}

type TabID = 
  | 'text' 
  | 'context' 
  | 'lexical' 
  | 'interpretation' 
  | 'application' 
  | 'slides'
  | 'sermon';

const StudyViewer: React.FC<StudyViewerProps> = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabID>('text');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'text', label: 'Texto', icon: BookOpen },
    { id: 'context', label: 'Contexto', icon: History },
    { id: 'lexical', label: 'Léxico', icon: Languages },
    { id: 'interpretation', label: 'Interpretação', icon: Users },
    { id: 'application', label: 'Aplicação', icon: Lightbulb },
    { id: 'sermon', label: 'Púlpito', icon: Mic2 },
    { id: 'slides', label: 'Slides', icon: Presentation },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = async () => {
    // Construct the URL with query parameters
    const params = new URLSearchParams();
    params.set('ref', data.meta.reference);
    params.set('trans', data.meta.translation);
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    try {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
        console.error("Failed to copy link", err);
    }
  };

  const handleExport = (type: 'pdf' | 'doc' | 'pptx' | 'md') => {
    setShowExportMenu(false);
    switch (type) {
      case 'md':
        const md = exportToMarkdown(data);
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estudo-${data.meta.reference.replace(/\s/g, '_')}.md`;
        a.click();
        break;
      case 'pptx':
        exportToPPTX(data);
        break;
      case 'doc':
        exportToDoc(data);
        break;
      case 'pdf':
        exportToPDF(data);
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 overflow-hidden font-sans">
      {/* Header Elegant */}
      <header className="bg-white border-b border-stone-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors border border-transparent hover:border-stone-200"
            title="Voltar para busca"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-stone-900 font-serif tracking-tight">{data.meta.reference}</h1>
            <span className="text-xs font-semibold text-stone-500 px-2 py-0.5 bg-stone-100 rounded uppercase tracking-wider border border-stone-200 font-sans">
              {data.meta.translation}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {/* Share Button */}
            <div className="relative">
                <button
                    onClick={handleShare}
                    className="p-2.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors border border-transparent hover:border-stone-200"
                    title="Copiar link do estudo"
                >
                    {showShareToast ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                </button>
                {showShareToast && (
                    <div className="absolute top-12 right-0 bg-stone-800 text-white text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap animate-fadeIn font-sans">
                        Link copiado!
                    </div>
                )}
            </div>

            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-stone-100 bg-stone-900 border border-transparent rounded-lg hover:bg-stone-800 shadow-lg shadow-stone-900/10 transition-all font-sans"
                >
                    <Download className="w-4 h-4" />
                    Exportar
                </button>
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="sm:hidden p-2 text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200"
                >
                <Menu className="w-5 h-5" />
                </button>
                
                {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-stone-100 overflow-hidden z-50 ring-1 ring-black ring-opacity-5">
                    <div className="p-1.5 space-y-0.5 font-sans">
                    <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors group">
                        <div className="p-1.5 bg-red-50 text-red-700 rounded group-hover:bg-red-100"><FileText className="w-4 h-4" /></div>
                        <div className="text-left">
                        <div className="font-medium">PDF</div>
                        <div className="text-[10px] text-stone-400">Documento leitura</div>
                        </div>
                    </button>
                    <button onClick={() => handleExport('doc')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors group">
                        <div className="p-1.5 bg-blue-50 text-blue-700 rounded group-hover:bg-blue-100"><FileType2 className="w-4 h-4" /></div>
                        <div className="text-left">
                        <div className="font-medium">Word / Doc</div>
                        <div className="text-[10px] text-stone-400">Documento editável</div>
                        </div>
                    </button>
                    <button onClick={() => handleExport('pptx')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors group">
                        <div className="p-1.5 bg-amber-50 text-amber-700 rounded group-hover:bg-amber-100"><Presentation className="w-4 h-4" /></div>
                        <div className="text-left">
                        <div className="font-medium">PowerPoint</div>
                        <div className="text-[10px] text-stone-400">Apresentação slides</div>
                        </div>
                    </button>
                    <div className="h-px bg-stone-100 my-1 mx-2"></div>
                    <button onClick={() => handleExport('md')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors group">
                        <div className="p-1.5 bg-stone-100 text-stone-600 rounded group-hover:bg-stone-200"><File className="w-4 h-4" /></div>
                        <div className="text-left">
                        <div className="font-medium">Markdown</div>
                        <div className="text-[10px] text-stone-400">Texto puro</div>
                        </div>
                    </button>
                    </div>
                </div>
                )}
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation - Elegant & Minimal */}
        <nav className="w-64 bg-white border-r border-stone-200 flex-col py-6 hidden md:flex shrink-0 font-sans">
          <div className="px-4 mb-4 text-xs font-semibold text-stone-400 uppercase tracking-widest font-sans">Seções</div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabID)}
                className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all w-full text-left border-l-[3px] font-sans ${
                  isActive
                    ? 'border-stone-800 bg-stone-50 text-stone-900'
                    : 'border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-800' : 'text-stone-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Nav (Bottom) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around p-2 z-50 overflow-x-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] font-sans">
             {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabID)}
                    className={`flex flex-col items-center p-2 min-w-[60px] rounded-lg transition-colors font-sans ${
                      isActive ? 'text-stone-900 bg-stone-100' : 'text-stone-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
        </nav>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 scroll-smooth bg-stone-50/50">
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            
            {activeTab === 'text' && (
              <>
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                  <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-6 font-sans">Texto Sagrado ({data.meta.translation})</h2>
                  {/* Scripture text is Serif for stylistic distinction, but justified */}
                  <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-stone-800 pl-6 border-l-4 border-stone-800 italic text-justify hyphens-auto">
                    {data.content.text_base}
                  </blockquote>
                </section>

                <section className="grid md:grid-cols-2 gap-6">
                    <div className="bg-stone-900 text-stone-50 rounded-2xl p-8 shadow-lg shadow-stone-900/10">
                        <h3 className="font-bold text-stone-200 mb-4 flex items-center gap-2 font-serif text-lg">
                            <Lightbulb className="w-5 h-5 text-amber-400"/> Resumo Executivo
                        </h3>
                        <p className="leading-relaxed text-stone-300 font-light text-justify hyphens-auto font-sans">{data.summary.executive}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                        <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 font-serif text-lg">
                             <Presentation className="w-5 h-5 text-stone-600"/> Pontos para Pregação
                        </h3>
                        <ul className="space-y-4 font-sans">
                            {data.summary.preaching_points.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-stone-700">
                                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-900 border border-stone-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 font-sans">{i + 1}</span>
                                    <span className="text-justify">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                 <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Introdução & Definição</h2>
                  <div className="text-stone-700 leading-relaxed whitespace-pre-wrap font-sans text-lg text-justify hyphens-auto">{data.content.intro_definition}</div>
                </section>
              </>
            )}

            {activeTab === 'context' && (
              <div className="space-y-6">
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <BookOpen className="w-32 h-32" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-blue-50 text-blue-900 rounded-lg"><BookOpen className="w-5 h-5" /></div>
                          <h2 className="text-2xl font-serif font-bold text-stone-900">Contexto Literário</h2>
                      </div>
                      <p className="text-stone-700 leading-relaxed text-lg text-justify hyphens-auto font-sans">{data.content.context_literary}</p>
                    </div>
                </section>

                <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                      <History className="w-32 h-32" />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-amber-50 text-amber-900 rounded-lg"><History className="w-5 h-5" /></div>
                          <h2 className="text-2xl font-serif font-bold text-stone-900">Contexto Histórico</h2>
                      </div>
                      <p className="text-stone-700 leading-relaxed text-lg text-justify hyphens-auto font-sans">{data.content.context_historical}</p>
                    </div>
                </section>

                {/* Seção de Paralelos e Correlações */}
                {data.content.parallels && data.content.parallels.length > 0 && (
                  <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <GitMerge className="w-32 h-32" />
                      </div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 text-purple-900 rounded-lg"><GitMerge className="w-5 h-5" /></div>
                            <h2 className="text-2xl font-serif font-bold text-stone-900">Paralelos e Correlações Bíblicas</h2>
                        </div>
                        <div className="grid gap-4">
                            {data.content.parallels.map((item, idx) => (
                                <div key={idx} className="bg-stone-50 border border-stone-100 rounded-lg p-5 hover:border-purple-100 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <h4 className="font-bold text-stone-900 text-lg font-serif">{item.reference}</h4>
                                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded uppercase tracking-wider font-sans">{item.correlation}</span>
                                    </div>
                                    <p className="text-stone-700 text-justify hyphens-auto font-sans">{item.text}</p>
                                </div>
                            ))}
                        </div>
                      </div>
                  </section>
                )}

                <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg"><Book className="w-5 h-5" /></div>
                        <h2 className="text-2xl font-serif font-bold text-stone-900">Intertextualidade</h2>
                    </div>
                    <p className="text-stone-700 leading-relaxed text-lg text-justify hyphens-auto font-sans">{data.content.intertextuality}</p>
                </section>
              </div>
            )}

            {activeTab === 'lexical' && (
              <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-8 border-b border-stone-100 bg-stone-50/50">
                    <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-3">
                        <Languages className="w-6 h-6 text-stone-600"/> 
                        Análise Léxica
                    </h2>
                    <p className="text-stone-500 mt-2 font-sans">Termos originais no Grego/Hebraico e suas nuances teológicas.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead className="bg-stone-50 text-stone-500 font-medium text-xs uppercase tracking-wider border-b border-stone-100 font-sans">
                            <tr>
                                <th className="px-8 py-4">Palavra</th>
                                <th className="px-8 py-4">Original</th>
                                <th className="px-8 py-4">Morfologia</th>
                                <th className="px-8 py-4">Significado e Nuances</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {data.content.lexical_analysis.map((item, idx) => (
                                <tr key={idx} className="hover:bg-stone-50 transition-colors font-sans">
                                    <td className="px-8 py-6 font-bold text-stone-900">{item.word}</td>
                                    <td className="px-8 py-6">
                                        <div className="font-serif text-xl text-stone-800">{item.lemma}</div>
                                        <div className="text-xs text-stone-400 italic mt-1 font-sans">{item.transliteration}</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-stone-600 font-mono bg-stone-50/50">{item.morphology}</td>
                                    <td className="px-8 py-6 text-sm text-stone-700 leading-relaxed text-justify hyphens-auto">{item.meaning}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </section>
            )}

            {activeTab === 'interpretation' && (
              <div className="space-y-8">
                <section>
                    <h3 className="text-lg font-bold text-stone-400 uppercase tracking-widest mb-6 px-2 font-serif">Linhas Interpretativas</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {data.content.interpretations.map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-stone-400 transition-colors">
                                <span className="inline-block px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded mb-4 uppercase tracking-wider font-sans">
                                    {item.tradition}
                                </span>
                                <p className="text-stone-700 leading-relaxed text-justify hyphens-auto font-sans">{item.summary}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                    <h3 className="text-2xl font-serif font-bold text-stone-900 mb-8 flex items-center gap-3">
                        <Users className="w-6 h-6 text-stone-600" />
                        Teólogos & Comentaristas
                    </h3>
                    <div className="space-y-6">
                        {data.content.theologians.map((t, i) => (
                            <div key={i} className="flex gap-6 p-6 rounded-2xl bg-stone-50 border border-stone-100">
                                <div className="hidden sm:flex w-14 h-14 rounded-full bg-stone-200 border-2 border-white shadow-sm items-center justify-center text-stone-600 font-bold text-2xl font-serif shrink-0">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h4 className="font-bold text-stone-900 text-lg font-serif">{t.name}</h4>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded border border-stone-200 text-stone-500 uppercase tracking-wider bg-white font-sans">
                                            {t.era}
                                        </span>
                                    </div>
                                    <p className="text-stone-700 text-lg leading-relaxed italic text-opacity-90 text-justify hyphens-auto font-sans">
                                        "{t.view}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
              </div>
            )}

            {activeTab === 'application' && (
              <div className="space-y-8">
                 <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Implicações Práticas & Doutrinárias</h2>
                  <div className="text-stone-700 leading-relaxed whitespace-pre-wrap text-lg text-justify hyphens-auto font-sans">{data.content.implications}</div>
                </section>

                <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
                    <div className="flex items-center gap-3 mb-8">
                        <HelpCircle className="w-6 h-6 text-stone-600" />
                        <h2 className="text-2xl font-serif font-bold text-stone-900">Perguntas para Reflexão</h2>
                    </div>
                    <ul className="grid gap-4">
                        {data.content.study_questions.map((q, i) => (
                            <li key={i} className="flex gap-5 items-start p-5 bg-stone-50 rounded-xl border border-stone-100">
                                <span className="text-stone-300 font-serif font-bold text-4xl leading-none select-none -mt-2">?</span>
                                <p className="text-stone-800 font-medium text-lg pt-1 font-sans text-justify hyphens-auto">{q}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="bg-stone-900 text-stone-200 rounded-2xl p-8 shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Book className="w-40 h-40 text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-white font-serif font-bold mb-8 flex items-center gap-3 text-xl">
                             <Book className="w-6 h-6 text-amber-500"/> Bibliografia Comentada
                        </h3>
                        <div className="space-y-8">
                            {data.content.bibliography.map((b, i) => (
                                <div key={i} className="group">
                                    <div className="font-serif text-xl text-amber-50 mb-2">
                                        <span className="font-bold text-white border-b border-stone-700 pb-0.5">{b.author}</span>. 
                                        <span className="italic text-amber-100"> {b.title}</span>. 
                                        {b.publisher && <span className="text-stone-400 text-base font-sans"> {b.publisher},</span>}
                                        {b.year && <span className="text-stone-400 text-base font-sans"> {b.year}.</span>}
                                    </div>
                                    <p className="text-sm text-stone-400 leading-relaxed pl-4 border-l-2 border-stone-700 mt-3 group-hover:border-amber-500 transition-colors text-justify hyphens-auto font-sans">
                                        {b.annotation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
              </div>
            )}

            {activeTab === 'sermon' && data.sermon && (
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-md rounded-2xl border border-stone-200 print:shadow-none print:border-none">
                    {/* Header do Manuscrito */}
                    <div className="border-b-2 border-stone-900 pb-6 mb-8 text-center">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-2 leading-tight">
                            {data.sermon.title}
                        </h2>
                        <p className="font-sans text-stone-500 uppercase tracking-widest text-sm font-semibold mb-2">
                            {data.meta.reference}
                        </p>
                        {data.sermon.text_focus && (
                             <p className="font-serif text-stone-600 italic text-lg bg-stone-50 inline-block px-4 py-1 rounded">
                                Texto Foco: {data.sermon.text_focus}
                            </p>
                        )}
                    </div>

                    <div className="prose prose-stone max-w-none">
                        {/* Introdução */}
                        <div className="mb-8">
                            <h3 className="font-bold text-stone-900 text-xl uppercase tracking-wide border-l-4 border-amber-500 pl-3 mb-4 font-serif">
                                Introdução
                            </h3>
                            <p className="text-lg leading-relaxed text-stone-800 font-sans text-justify hyphens-auto">
                                {data.sermon.introduction}
                            </p>
                        </div>

                        {/* Tópicos */}
                        <div className="space-y-10">
                            {data.sermon.points.map((point, idx) => (
                                <div key={idx} className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="bg-stone-900 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold font-serif shadow-sm">
                                            {idx + 1}
                                        </span>
                                        <h4 className="font-bold text-stone-900 text-xl font-serif">
                                            {point.title}
                                        </h4>
                                    </div>
                                    <p className="text-stone-800 text-lg mb-4 leading-relaxed pl-11 text-justify hyphens-auto font-sans">
                                        {point.explanation}
                                    </p>
                                    
                                    <div className="pl-11 space-y-3">
                                        <div className="flex gap-2 text-stone-600 italic bg-white p-3 rounded-lg border border-stone-100 text-base">
                                            <Lightbulb className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                                            <span className="text-justify hyphens-auto font-sans">{point.illustration}</span>
                                        </div>
                                        <div className="flex gap-2 text-stone-700 font-medium bg-stone-100 p-3 rounded-lg border border-stone-200 text-base">
                                            <ArrowRight className="w-5 h-5 shrink-0 text-stone-900 mt-0.5" />
                                            <span className="text-justify hyphens-auto font-sans">{point.application}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Conclusão */}
                        <div className="mt-10 pt-8 border-t border-stone-200">
                             <h3 className="font-bold text-stone-900 text-xl uppercase tracking-wide border-l-4 border-stone-900 pl-3 mb-4 font-serif">
                                Conclusão & Apelo
                            </h3>
                            <p className="text-lg leading-relaxed text-stone-800 font-sans text-justify hyphens-auto">
                                {data.sermon.conclusion}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'sermon' && !data.sermon && (
                 <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                    <Mic2 className="w-12 h-12 text-stone-300 mb-4" />
                    <h3 className="text-xl font-bold text-stone-700 mb-2 font-serif">Sermão não gerado</h3>
                    <p className="text-stone-500 max-w-md font-sans">
                        Para ver o esboço completo de pregação, selecione a opção <strong>"Sermão Expositivo"</strong> no menu de profundidade antes de gerar o estudo.
                    </p>
                </div>
            )}


            {activeTab === 'slides' && (
                <div className="space-y-8">
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 items-start">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 font-sans">
                            Estes slides são gerados automaticamente para auxiliar no ensino. Utilize o botão <strong>Exportar</strong> no topo para baixar o arquivo PowerPoint (.pptx).
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data.slides.map((slide, idx) => (
                            <div key={idx} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-auto flex flex-col group min-h-[300px]">
                                <div className="bg-stone-900 p-5 shrink-0 group-hover:bg-stone-800 transition-colors">
                                    <h3 className="text-white font-bold text-xl leading-tight font-serif">{slide.title}</h3>
                                </div>
                                <div className="p-6 flex-1 bg-white flex flex-col justify-between relative">
                                    <ul className="list-disc pl-5 space-y-3 text-stone-700 text-lg font-sans">
                                        {slide.bullets.map((bullet, bIdx) => (
                                            <li key={bIdx} className="pl-1 marker:text-stone-400 leading-snug">{bullet}</li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 pt-4 border-t border-stone-100 text-xs text-stone-400 italic flex items-center gap-2 font-sans">
                                        <Presentation className="w-3 h-3" />
                                        Visual: {slide.image_hint}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="h-12" />
          </div>
        </main>
      </div>
    </div>
  );
};

function ArrowRight(props: any) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" viewBox="0 0 24 24" 
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
            {...props}
        >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    )
}

export default StudyViewer;