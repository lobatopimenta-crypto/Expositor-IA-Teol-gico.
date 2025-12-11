import { GoogleGenAI, Schema, Type } from "@google/genai";
import { StudyRequest, StudyData } from "../types";

// Schema definition for Structured Output
const studySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        reference: { type: Type.STRING },
        translation: { type: Type.STRING },
        generated_at: { type: Type.STRING },
      },
      required: ["reference", "translation"],
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        executive: { type: Type.STRING },
        preaching_points: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["executive", "preaching_points"],
    },
    content: {
      type: Type.OBJECT,
      properties: {
        text_base: { type: Type.STRING },
        intro_definition: { type: Type.STRING },
        context_literary: { type: Type.STRING },
        context_historical: { type: Type.STRING },
        parallels: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              reference: { type: Type.STRING },
              text: { type: Type.STRING },
              correlation: { type: Type.STRING, description: "Relationship type: Synoptic, OT Quote, thematic parallel" },
            },
            required: ["reference", "text", "correlation"],
          },
        },
        lexical_analysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              lemma: { type: Type.STRING },
              transliteration: { type: Type.STRING },
              morphology: { type: Type.STRING, description: "Strict morphological breakdown: Part of speech, Tense, Voice, Mood, Case, Gender, Number (e.g. 'Verbo Aoristo Indicativo Ativo, 3ª Sing')" },
              meaning: { type: Type.STRING, description: "Definition and at least 2 distinct semantic nuances or translation options" },
            },
            required: ["word", "lemma", "meaning"],
          },
        },
        intertextuality: { type: Type.STRING },
        interpretations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tradition: { type: Type.STRING },
              summary: { type: Type.STRING },
            },
            required: ["tradition", "summary"],
          },
        },
        theologians: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              era: { type: Type.STRING, description: "Historical period/Century (e.g., 'Patrística (Séc IV)', 'Reforma (Séc XVI)', 'Contemporâneo')" },
              view: { type: Type.STRING, description: "Summary of their specific view on this passage" },
            },
            required: ["name", "era", "view"],
          },
        },
        implications: { type: Type.STRING },
        study_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
        bibliography: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              author: { type: Type.STRING },
              title: { type: Type.STRING },
              publisher: { type: Type.STRING },
              year: { type: Type.STRING },
              annotation: { type: Type.STRING, description: "Brief comment on why this source is valuable" },
            },
            required: ["author", "title", "annotation"],
          },
        },
      },
      required: [
        "text_base",
        "intro_definition",
        "context_literary",
        "context_historical",
        "parallels",
        "lexical_analysis",
        "interpretations",
        "implications",
        "theologians",
        "bibliography"
      ],
    },
    sermon: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Um título atraente e bíblico para o sermão" },
        text_focus: { type: Type.STRING, description: "MANDATORY: The specific verses or pericope focused on in this sermon (e.g. 'Mateus 3:11-12' or 'Versículos 1 a 4'). Must be specific." },
        introduction: { type: Type.STRING, description: "Gancho inicial e proposição do sermão" },
        points: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              explanation: { type: Type.STRING, description: "Explicação exegética do ponto. OBRIGATÓRIO: Incluir referências bíblicas explícitas (ex: 'como diz em Rm 3:23') ao citar outros textos." },
              illustration: { type: Type.STRING, description: "Ilustração prática ou metáfora" },
              application: { type: Type.STRING, description: "Aplicação direta para a vida hoje. OBRIGATÓRIO: Cite versículos de apoio com referência completa." },
            },
            required: ["title", "explanation", "illustration", "application"]
          }
        },
        conclusion: { type: Type.STRING, description: "Resumo e apelo final" }
      },
      required: ["title", "text_focus", "introduction", "points", "conclusion"]
    },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          image_hint: { type: Type.STRING },
        },
        required: ["title", "bullets"],
      },
    },
  },
  required: ["meta", "summary", "content", "slides", "sermon"],
};

export const generateStudy = async (
  request: StudyRequest
): Promise<StudyData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Define instruction logic based on depth
  let depthInstructions = "";
  let toneInstruction = "";
  let lexicalInstruction = "";
  let theologyInstruction = "";
  let sermonInstruction = "";

  switch (request.depth) {
    case 'rapido':
      toneInstruction = "Tom devocional, inspirador, prático e conciso. Linguagem simples e direta.";
      lexicalInstruction = "Selecione 3 a 5 palavras-chave essenciais. Inclua morfologia básica e pelo menos 2 nuances de significado para cada uma.";
      theologyInstruction = "Apresente 3 ou 4 visões principais focadas no consenso cristão geral (ex: Histórica, Evangélica, Aplicação Prática). Liste teólogos breves e indique sua era (ex: Séc XX).";
      depthInstructions = "Priorize a brevidade. O objetivo é leitura rápida e edificação.";
      sermonInstruction = "Gere um esboço de sermão DEVOCIONAL curto. Defina o 'text_focus' com precisão (ex: apenas o versículo principal). Use referências bíblicas claras.";
      break;

    case 'academico':
      toneInstruction = "Tom estritamente acadêmico, crítico e exegético. Linguagem formal, técnica.";
      lexicalInstruction = "OBRIGATÓRIO: Analise entre 5 e 7 palavras gregas/hebraicas chave. Para CADA palavra, forneça a MORFOLOGIA COMPLETA (Classe, Tempo, Voz, Modo, Caso, Gênero, Número) e detalhe pelo menos 2 nuances semânticas distintas ou opções de tradução baseadas em léxicos acadêmicos (BDAG/HALOT).";
      theologyInstruction = "Análise exaustiva das linhas interpretativas (mínimo 6 tradições). Para a seção de teólogos, É OBRIGATÓRIO preencher o campo 'era' com o período histórico específico (ex: 'Patrística', 'Escolástica', 'Séc. XIX'). Cite autores de peso acadêmico.";
      depthInstructions = "Priorize a profundidade técnica, crítica textual e precisão histórica. A seção de interpretação deve confrontar diferentes escolas de pensamento.";
      sermonInstruction = "Gere um esboço de sermão EXPOSITIVO SÓLIDO e denso. Cite abundantemente outros textos bíblicos com referência completa (Livro Cap:Verso) para justificar a exegese e a aplicação.";
      break;
    
    case 'sermao':
      toneInstruction = "Tom pastoral, proclamativo, persuasivo e eloquente. Focado na comunicação oral e aplicação.";
      lexicalInstruction = "Selecione 3 a 5 palavras-chave que trazem riqueza para a pregação. Explique-as de forma que possa ser usada no púlpito.";
      theologyInstruction = "Apresente uma variedade de visões (5 a 6) que enriqueçam a pregação, incluindo: Reformada, Wesleyana, Pentecostal. Cite pregadores clássicos e INDIQUE A ERA de cada um (ex: 'Puritano', 'Séc XIX').";
      depthInstructions = "O foco total é gerar um sermão bíblico completo e estruturado para o pregador. A exegese deve servir à homilética.";
      sermonInstruction = "PRIORIDADE MÁXIMA: Gere um SERMÃO EXPOSITIVO COMPLETO. Estruture com Introdução, Divisões Claras (Tópicos), Ilustrações e Conclusão. Use OBRIGATORIAMENTE referências bíblicas (ex: Rm 3:23) na explicação e aplicação de CADA ponto.";
      break;

    case 'detalhado':
    default:
      toneInstruction = "Tom educacional, didático e equilibrado. Linguagem acessível mas robusta.";
      lexicalInstruction = "Selecione 5 a 7 palavras importantes. Inclua morfologia detalhada (classe, tempo, voz, modo) e explique pelo menos 2 nuances de significado para cada termo.";
      theologyInstruction = "Apresente uma ampla gama de linhas interpretativas (mínimo 5 a 7). Inclua: Tradição Católica, Reformada (Calvinista), Luterana, Armínio-Wesleyana, Pentecostal. Ao citar teólogos, OBRIGATÓRIO incluir o campo 'era' com o período histórico.";
      depthInstructions = "Equilíbrio entre profundidade e clareza. Ideal para preparar uma aula de Escola Bíblica.";
      sermonInstruction = "Gere um esboço de sermão EXPOSITIVO equilibrado. Cada ponto de aplicação DEVE conter citações bíblicas de apoio com referências (ex: Jo 1:1).";
      break;
  }

  const systemPrompt = `
    Você é um especialista em exegese bíblica e homilética.
    Sua tarefa é gerar um estudo bíblico estruturado em JSON.
    
    CONFIGURAÇÃO DE PROFUNDIDADE: ${request.depth.toUpperCase()}
    
    DIRETRIZES DE ESTILO:
    - Tom: ${toneInstruction}
    - Instrução Geral: ${depthInstructions}
  `;

  const userPrompt = `
    Gere um estudo para a passagem: "${request.passage}"
    Tradução: "${request.translation}"
    
    Siga estritamente estas instruções para o conteúdo:
    
    1. ANÁLISE LÉXICA: ${lexicalInstruction}
    2. TEOLOGIA E INTÉRPRETES: ${theologyInstruction}. Certifique-se de preencher o campo 'era' para todos os teólogos listados.
    3. TEXTO BASE: Retorne o texto completo na tradução ${request.translation}.
    4. PARALELOS E CORRELAÇÕES: Busque textos paralelos em outros livros (ex: se for um Evangelho, busque os Sinóticos; se for AT, onde é citado no NT). Liste pelo menos 3 correlações.
    5. ESTRUTURA: Preencha todos os campos do JSON Schema fornecido.
    6. SLIDES: Gere um esboço de apresentação compatível com o nível ${request.depth}.
    7. SERMÃO: ${sermonInstruction} 
       - CAMPO 'text_focus': Defina exatamente qual trecho, versículos ou perícope é a base deste sermão (ex: "v. 1-3" ou "Mateus 3:11"). NÃO deixe genérico.
       - IMPORTANTE: Em cada ponto do sermão (especialmente na Aplicação), você DEVE citar versículos bíblicos de apoio. Sempre que fizer uma citação ou alusão bíblica, coloque a referência completa ao lado, ex: "como Paulo diz (Romanos 3:23)".
  `;

  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: userPrompt }] },
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: studySchema,
          temperature: request.depth === 'academico' ? 0.3 : 0.7,
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text) as StudyData;
        // Enforce the generated_at date if the AI mocked it poorly
        data.meta.generated_at = new Date().toISOString();
        data.meta.translation = request.translation;
        data.meta.reference = request.passage;
        
        return data;
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error: any) {
        console.warn(`Gemini API Attempt ${attempt} failed:`, error);
        lastError = error;
        
        // Retry logic for transient errors (Network/XHR or Server 500s)
        const isRetryable = !error.status || error.status >= 500 || error.message?.includes("xhr error");
        
        if (isRetryable && attempt < maxRetries) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = 1000 * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
        }
        
        // If not retryable or max attempts reached, stop loop
        break;
    }
  }

  console.error("Gemini API Final Error:", lastError);
  throw lastError;
};