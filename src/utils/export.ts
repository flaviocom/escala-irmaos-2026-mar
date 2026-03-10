import { toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Versão Estável (Aprovada): Manipula o DOM original via CSS e tira a foto.
 */
export async function exportToImage(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) return;

  // 1. Identificar se houver filtros
  const activeFiltersText = document.getElementById('active-filters-count')?.textContent || "0";
  const isFiltered = parseInt(activeFiltersText) > 0;

  // 2. Trava de segurança para escalas sem filtro (evita a 'tira infinita')
  const totalItems = node.querySelectorAll('.export-item').length;
  let forceLimit = false;

  if (!isFiltered && totalItems > 20) {
    forceLimit = true;
    const confirmLimit = confirm(
      `Sua escala está com ${totalItems} dias. \n\n` +
      "Para a foto não ficar gigante e ilegível, vamos gerar apenas os primeiros 20 dias. \n" +
      "Se precisar da escala completa, selecione um 'Mês' antes."
    );
    if (!confirmLimit) return;
  }

  // 3. Iniciar modo de exportação
  document.body.classList.add('is-exporting');
  if (forceLimit) document.body.classList.add('limit-export');

  const exportHeader = document.getElementById('export-header');

  try {
    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // Esperar renderização e layout estabilizarem
    await new Promise(resolve => setTimeout(resolve, 600));

    // Gerar a foto diretamente do elemento ORIGINAL (sem clones problemáticos)
    const blob = await toBlob(node, {
      quality: 0.95,
      pixelRatio: 2.5, // Resolução premium
      backgroundColor: '#ffffff',
      width: 1000,
      fontEmbedCSS: '', // Evita problemas com fontes externas em alguns navegadores
      style: {
        transform: 'none',
        width: '1000px',
        margin: '0',
        padding: '30px'
      }
    });

    if (!blob) throw new Error('Blob nulo');

    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 📱 MOBILE: Share Nativo
    if (isMobile && navigator.share) {
      try {
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({ files: [file], title: 'Escala Porteiros' });
        return;
      } catch (e) {
        console.warn('Share nativo falhou');
      }
    }

    // 💻 PC: Download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);

  } catch (err) {
    console.error('Falha na exportação:', err);
    alert("Houve um erro técnico ao gerar a foto. Tente dar um print na tela.");
  } finally {
    // Restaurar interface
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');
    document.body.classList.remove('limit-export');
  }
}
