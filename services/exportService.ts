import { StudyData } from "../types";

// Declare globals for the CDN libraries
declare global {
  interface Window {
    html2pdf: any;
    PptxGenJS: any;
  }
}

export const exportToMarkdown = (data: StudyData): string => {
  const { meta, summary, content, slides, sermon } = data;

  const parallels = content.parallels && content.parallels.length > 0
    ? `
## Paralelos e Correlações
${content.parallels.map(p => `### ${p.reference} (${p.correlation})
${p.text}`).join('\n\n')}
`
    : '';

  let md = `
# Estudo Exegético: ${meta.reference}
**Tradução:** ${meta.translation}
**Gerado em:** ${new Date(meta.generated_at).toLocaleDateString()}

---

## Resumo Executivo
${summary.executive}

### Pontos para Pregação
${summary.preaching_points.map(p => `- ${p}`).join('\n')}

---

## Texto Base
> ${content.text_base}

## Introdução
${content.intro_definition}

## Contexto
**Literário:** ${content.context_literary}

**Histórico:** ${content.context_historical}
${parallels}

## Análise Léxica
| Palavra | Original | Morfologia | Significado |
|---------|----------|------------|-------------|
${content.lexical_analysis.map(l => `| ${l.word} | ${l.lemma} (${l.transliteration}) | ${l.morphology} | ${l.meaning} |`).join('\n')}

## Interpretação
${content.interpretations.map(i => `### ${i.tradition}\n${i.summary}`).join('\n\n')}

### Teólogos e Pensadores
${content.theologians.map(t => `#### ${t.name} (${t.era})
${t.view}`).join('\n\n')}

## Aplicação
${content.implications}

## Perguntas para Estudo
${content.study_questions.map(q => `- ${q}`).join('\n')}

## Bibliografia Comentada
${content.bibliography.map(b => `### ${b.author}. *${b.title}*. ${b.publisher || ''}, ${b.year || ''}.
> ${b.annotation}`).join('\n\n')}
`;

  if (sermon) {
    md += `
---
# SERMÃO EXPOSITIVO: ${sermon.title}

**Texto:** ${sermon.text_focus}

## Introdução
${sermon.introduction}

## Tópicos
${sermon.points.map((p, i) => `
### ${i+1}. ${p.title}
${p.explanation}

*Ilustração:* ${p.illustration}
*Aplicação:* ${p.application}
`).join('\n')}

## Conclusão
${sermon.conclusion}
`;
  }

  md += `
---
## Esboço de Slides
${slides.map((s, i) => `
### Slide ${i + 1}: ${s.title}
${s.bullets.map(b => `- ${b}`).join('\n')}
*Visual:* ${s.image_hint}
`).join('\n')}
  `;

  return md.trim();
};

export const exportToPPTX = async (data: StudyData) => {
  if (!window.PptxGenJS) {
    console.error("PptxGenJS library not loaded");
    return;
  }

  const pptx = new window.PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = `Estudo: ${data.meta.reference}`;

  // Master Slide Definition
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 6.9, w: '100%', h: 0.6, fill: { color: '1c1917' } } }, // stone-900
      { text: { text: 'Exegesis AI', options: { x: 0.5, y: 7.05, fontSize: 12, color: 'FFFFFF' } } },
      { text: { text: 'Celpf', options: { x: 12.5, y: 7.05, fontSize: 10, color: 'AAAAAA', italic: true } } } // Added signature to slides
    ]
  });

  // Title Slide
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText(data.meta.reference, { x: 1, y: 2, w: '80%', fontSize: 44, color: '1c1917', bold: true, align: 'center', fontFace: 'Merriweather' });
  slide.addText(`Tradução: ${data.meta.translation}`, { x: 1, y: 3.5, w: '80%', fontSize: 24, color: '57534e', align: 'center' });

  // Content Slides
  data.slides.forEach((s) => {
    slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    
    // Title
    slide.addText(s.title, { x: 0.5, y: 0.5, w: '90%', fontSize: 28, color: '1c1917', bold: true, fontFace: 'Merriweather' });
    
    // Bullets
    slide.addText(s.bullets.map(b => ({ text: b, options: { breakLine: true } })), {
        x: 0.5, y: 1.5, w: '60%', h: '60%', fontSize: 18, color: '1c1917', bullet: true
    });

    // Image Hint / Notes (in a box)
    slide.addText(`Sugestão Visual: ${s.image_hint}`, {
        x: 7, y: 1.5, w: '25%', fontSize: 12, color: '888888', italic: true, fill: { color: 'F5F5F4' }
    });
  });

  // Sermon Slides (if available)
  if (data.sermon) {
      // Divider
      slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      slide.addText("Esboço de Sermão", { x: 1, y: 3, w: '80%', fontSize: 36, color: '1c1917', align: 'center' });

      data.sermon.points.forEach((p, i) => {
          slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
          slide.addText(`${i+1}. ${p.title}`, { x: 0.5, y: 0.5, w: '90%', fontSize: 28, color: '1c1917', bold: true, fontFace: 'Merriweather' });
          
          slide.addText([
              { text: "Explicação: ", options: { bold: true } },
              { text: p.explanation, options: { breakLine: true } },
              { text: "\n", options: { breakLine: true } },
              { text: "Aplicação: ", options: { bold: true, color: 'b45309' } }, // amber-700
              { text: p.application, options: { breakLine: true } }
          ], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '44403c' });
      });
  }

  pptx.writeFile({ fileName: `Estudo - ${data.meta.reference}.pptx` });
};

export const exportToDoc = (data: StudyData) => {
  let sermonHtml = '';
  if (data.sermon) {
      sermonHtml = `
      <div style="page-break-before: always;">
          <h1 style="text-align: center; color: #1c1917;">${data.sermon.title}</h1>
          <p style="text-align: center; font-style: italic;">Texto: ${data.sermon.text_focus}</p>
          
          <h2>Introdução</h2>
          <p>${data.sermon.introduction}</p>
          
          ${data.sermon.points.map((p, i) => `
              <h3>${i+1}. ${p.title}</h3>
              <p>${p.explanation}</p>
              <div style="background-color: #f5f5f4; padding: 10px; border-left: 3px solid #78716c; margin: 10px 0;">
                  <em>Ilustração:</em> ${p.illustration}
              </div>
              <div style="background-color: #fffbeb; padding: 10px; border-left: 3px solid #d97706; margin: 10px 0;">
                  <strong>Aplicação:</strong> ${p.application}
              </div>
          `).join('')}
          
          <h2>Conclusão</h2>
          <p>${data.sermon.conclusion}</p>
      </div>
      `;
  }

  const parallelsHtml = data.content.parallels && data.content.parallels.length > 0 
    ? `<h3>Paralelos e Correlações</h3>
       ${data.content.parallels.map(p => `<p><strong>${p.reference} (${p.correlation}):</strong> ${p.text}</p>`).join('')}`
    : '';

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${data.meta.reference}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #1c1917; }
        h1 { font-size: 18pt; color: #1c1917; }
        h2 { font-size: 14pt; color: #44403c; margin-top: 20px; border-bottom: 1px solid #e7e5e4; padding-bottom: 5px; }
        h3 { font-size: 13pt; color: #57534e; margin-top: 15px; }
        p { margin-bottom: 10px; line-height: 1.5; text-align: justify; }
        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
        th, td { border: 1px solid #e7e5e4; padding: 8px; text-align: left; }
        th { background-color: #f5f5f4; }
        blockquote { border-left: 3px solid #a8a29e; margin-left: 20px; padding-left: 10px; color: #44403c; font-style: italic; text-align: justify; }
        .footer-sig { text-align: right; font-size: 10pt; color: #a8a29e; font-style: italic; margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>Estudo Exegético: ${data.meta.reference}</h1>
      <p><strong>Tradução:</strong> ${data.meta.translation}<br>
      <strong>Data:</strong> ${new Date(data.meta.generated_at).toLocaleDateString()}</p>
      
      <h2>Resumo Executivo</h2>
      <p>${data.summary.executive}</p>

      <h2>Texto Base</h2>
      <blockquote>${data.content.text_base}</blockquote>

      <h2>Contexto</h2>
      <h3>Literário</h3>
      <p>${data.content.context_literary}</p>
      <h3>Histórico</h3>
      <p>${data.content.context_historical}</p>
      ${parallelsHtml}

      <h2>Análise Léxica</h2>
      <table>
        <tr><th>Palavra</th><th>Original</th><th>Morfologia</th><th>Significado</th></tr>
        ${data.content.lexical_analysis.map(l => 
          `<tr>
            <td><strong>${l.word}</strong></td>
            <td>${l.lemma}<br><em>${l.transliteration}</em></td>
            <td>${l.morphology}</td>
            <td>${l.meaning}</td>
           </tr>`
        ).join('')}
      </table>

      <h2>Interpretação</h2>
      ${data.content.interpretations.map(i => `<p><strong>${i.tradition}:</strong> ${i.summary}</p>`).join('')}

      <h2>Teólogos e Pensadores</h2>
      ${data.content.theologians.map(t => `<p><strong>${t.name} (${t.era}):</strong> ${t.view}</p>`).join('')}

      <h2>Implicações Práticas</h2>
      <p>${data.content.implications}</p>

      <h2>Bibliografia</h2>
      ${data.content.bibliography.map(b => `<p><strong>${b.author}</strong>. <em>${b.title}</em>. ${b.annotation}</p>`).join('')}
      
      ${sermonHtml}

      <div class="footer-sig">Celpf</div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Estudo - ${data.meta.reference}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: StudyData) => {
    if (!window.html2pdf) {
        console.error("html2pdf library not loaded");
        return;
    }

    // Logo SVG String
    const logoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1c1917" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="width: 100px; height: 100px; margin-bottom: 20px;">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      <line x1="12" y1="6" x2="12" y2="12"></line>
      <line x1="9" y1="9" x2="15" y2="9"></line>
      <path d="M12 2l1 2"></path>
      <path d="M10 2.5l1 1.5"></path>
      <path d="M14 2.5l-1 1.5"></path>
    </svg>
    `;

    // Sermon Section Construction
    let sermonSection = '';
    if (data.sermon) {
        sermonSection = `
        <div class="page-break" style="page-break-before: always; margin-top: 40px;">
            <div style="border-bottom: 2px solid #1c1917; margin-bottom: 30px; padding-bottom: 20px; text-align: center;">
                <h1 style="color: #1c1917; font-size: 26px; margin: 0;">${data.sermon.title}</h1>
                <p style="color: #44403c; font-style: italic; margin-top: 10px; font-size: 14px;">Texto Foco: ${data.sermon.text_focus}</p>
            </div>
            
            <h3 style="color: #1c1917; font-size: 18px; border-left: 4px solid #d97706; padding-left: 10px;">Introdução</h3>
            <p style="font-size: 14px; line-height: 1.6; text-align: justify;">${data.sermon.introduction}</p>
            
            ${data.sermon.points.map((p, i) => `
                <div style="margin-top: 25px; page-break-inside: avoid;">
                    <h3 style="color: #1c1917; font-size: 16px;">${i+1}. ${p.title}</h3>
                    <p style="font-size: 14px; line-height: 1.6; text-align: justify; margin-bottom: 10px;">${p.explanation}</p>
                    
                    <div style="background: #f5f5f4; padding: 12px; border-radius: 4px; margin: 8px 0; font-size: 13px; page-break-inside: avoid;">
                        <em>Ilustração:</em> ${p.illustration}
                    </div>
                    
                    <div style="background: #fff7ed; padding: 12px; border-radius: 4px; margin: 8px 0; font-size: 13px; border-left: 3px solid #f59e0b; page-break-inside: avoid;">
                        <strong>Aplicação:</strong> ${p.application}
                    </div>
                </div>
            `).join('')}
            
            <div style="margin-top: 30px; border-top: 1px solid #e7e5e4; padding-top: 20px; page-break-inside: avoid;">
                <h3 style="color: #1c1917; font-size: 18px;">Conclusão</h3>
                <p style="font-size: 14px; line-height: 1.6; text-align: justify;">${data.sermon.conclusion}</p>
            </div>
        </div>
        `;
    }

    const parallelsSection = data.content.parallels && data.content.parallels.length > 0
    ? `
      <div style="page-break-inside: avoid; margin-top: 25px;">
          <h2 style="font-size: 18px; color: #1c1917; border-bottom: 1px solid #e7e5e4; padding-bottom: 5px;">Paralelos e Correlações</h2>
          ${data.content.parallels.map(p => `
            <div style="margin-bottom: 15px;">
                <p style="font-size: 14px; line-height: 1.6; margin: 0;">
                <strong style="color: #57534e;">${p.reference} (${p.correlation}):</strong> ${p.text}
                </p>
            </div>`).join('')}
      </div>
    ` : '';

    // Main Container
    const content = document.createElement('div');
    content.innerHTML = `
    <div style="font-family: 'Times New Roman', serif; color: #1c1917;">
      
      <!-- CAPA -->
      <div style="height: 1050px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; padding: 40px; position: relative;">
        <div style="margin-bottom: 40px;">${logoSvg}</div>
        <h1 style="font-size: 48px; color: #1c1917; margin: 0 0 10px 0; font-weight: bold; letter-spacing: -1px;">Exegesis AI</h1>
        <p style="font-size: 18px; color: #78716c; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 60px;">Estudo Bíblico Sistemático</p>
        
        <div style="width: 60px; height: 4px; background-color: #d97706; margin-bottom: 60px;"></div>

        <h2 style="font-size: 36px; color: #1c1917; margin: 0 0 15px 0;">${data.meta.reference}</h2>
        <p style="font-size: 16px; color: #57534e; background-color: #f5f5f4; padding: 5px 15px; border-radius: 20px; display: inline-block;">Versão: ${data.meta.translation}</p>
        
        <div style="margin-top: auto; color: #a8a29e; font-size: 14px; position: relative;">
            <p>Gerado em ${new Date(data.meta.generated_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <!-- Signature in PDF Cover -->
        <div style="position: absolute; bottom: 20px; right: 20px; font-style: italic; color: #d6d3d1; font-size: 12px;">Celpf</div>
      </div>

      <!-- CONTEÚDO -->
      <div style="padding: 40px;">
        
        <!-- Header Página 2 -->
        <div style="border-bottom: 1px solid #e7e5e4; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
             <span style="font-size: 12px; color: #78716c; text-transform: uppercase;">Exegesis AI</span>
             <span style="font-size: 12px; color: #78716c;">${data.meta.reference}</span>
        </div>

        <div style="background: #f5f5f4; padding: 20px; border-radius: 8px; margin-bottom: 30px; page-break-inside: avoid;">
            <h3 style="margin-top:0; color: #44403c; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Resumo Executivo</h3>
            <p style="font-size: 14px; line-height: 1.6; text-align: justify; margin: 0;">${data.summary.executive}</p>
        </div>

        <h2 style="font-size: 18px; color: #1c1917; margin-top: 25px; border-bottom: 1px solid #e7e5e4; padding-bottom: 5px;">Texto Base</h2>
        <div style="font-style: italic; font-size: 15px; border-left: 4px solid #1c1917; padding-left: 20px; margin: 15px 0; text-align: justify; line-height: 1.8;">
            ${data.content.text_base}
        </div>

        <div style="page-break-inside: avoid;">
            <h2 style="font-size: 18px; color: #1c1917; margin-top: 30px; border-bottom: 1px solid #e7e5e4; padding-bottom: 5px;">Contexto</h2>
            <p style="font-size: 14px; line-height: 1.6; text-align: justify; margin-bottom: 15px;"><strong>Literário:</strong> ${data.content.context_literary}</p>
            <p style="font-size: 14px; line-height: 1.6; text-align: justify;"><strong>Histórico:</strong> ${data.content.context_historical}</p>
        </div>
        
        ${parallelsSection}

        <div style="page-break-inside: avoid; margin-top: 30px;">
            <h2 style="font-size: 18px; color: #1c1917; border-bottom: 1px solid #e7e5e4; padding-bottom: 5px;">Análise Léxica</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px;">
                <tr style="background: #e7e5e4;">
                <th style="padding: 10px; border: 1px solid #d6d3d1; text-align: left; width: 15%;">Termo</th>
                <th style="padding: 10px; border: 1px solid #d6d3d1; text-align: left; width: 20%;">Original</th>
                <th style="padding: 10px; border: 1px solid #d6d3d1; text-align: left;">Significado & Nuances</th>
                </tr>
                ${data.content.lexical_analysis.map(l => `
                <tr style="page-break-inside: avoid;">
                <td style="padding: 10px; border: 1px solid #d6d3d1; vertical-align: top;"><strong>${l.word}</strong></td>
                <td style="padding: 10px; border: 1px solid #d6d3d1; vertical-align: top;">
                    <div style="font-weight: bold;">${l.lemma}</div>
                    <div style="font-style: italic; color: #666;">${l.transliteration}</div>
                    <div style="font-size: 11px; color: #78716c; margin-top: 4px;">${l.morphology}</div>
                </td>
                <td style="padding: 10px; border: 1px solid #d6d3d1; text-align: justify; vertical-align: top;">${l.meaning}</td>
                </tr>`).join('')}
            </table>
        </div>

        <div style="margin-top: 30px;">
            <h2 style="font-size: 18px; color: #1c1917; border-bottom: 1px solid #e7e5e4; padding-bottom: 5px;">Interpretação Teológica</h2>
            ${data.content.interpretations.map(i => `
                <div style="margin-bottom: 15px; page-break-inside: avoid;">
                    <strong style="color: #d97706; text-transform: uppercase; font-size: 12px; display: block; margin-bottom: 4px;">${i.tradition}</strong>
                    <p style="font-size: 14px; margin: 0; text-align: justify;">${i.summary}</p>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 30px;">
            <h2 style="font-size: 18px; color: #1c1917; border-bottom: 1px solid #e7e5e4; padding-bottom: 5px;">Teólogos Relevantes</h2>
            ${data.content.theologians.map(t => `
                <div style="margin-bottom: 15px; padding-left: 15px; border-left: 2px solid #e7e5e4; page-break-inside: avoid;">
                    <div style="font-weight: bold; color: #1c1917;">${t.name} <span style="font-weight: normal; font-size: 12px; color: #78716c;">(${t.era})</span></div>
                    <p style="font-size: 14px; margin: 4px 0 0 0; text-align: justify;">${t.view}</p>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 30px; background: #fffbeb; padding: 20px; border-radius: 8px; page-break-inside: avoid;">
            <h2 style="font-size: 18px; color: #92400e; margin: 0 0 10px 0;">Implicações Práticas</h2>
            <p style="font-size: 14px; line-height: 1.6; text-align: justify; margin: 0;">${data.content.implications}</p>
        </div>

        <div style="margin-top: 30px;">
            <h2 style="font-size: 18px; color: #1c1917; border-bottom: 1px solid #e7e5e4; padding-bottom: 5px;">Bibliografia</h2>
            ${data.content.bibliography.map(b => `
                <p style="font-size: 12px; margin-bottom: 10px; text-align: justify; page-break-inside: avoid;">
                    • <strong>${b.author}</strong>. <em>${b.title}</em>. ${b.annotation}
                </p>`).join('')}
        </div>

        ${sermonSection}
      </div>
    </div>
    `;

    const opt = {
        margin:       0,
        filename:     `Estudo - ${data.meta.reference}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    window.html2pdf().set(opt).from(content).save();
};