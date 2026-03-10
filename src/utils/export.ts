import { toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Agora o ScheduleTable em si se encarrega de fatiar para 10 itens 
 * no momento do click via props "isExporting". 
 */
export async function exportToImage(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) return;

  // 1. Iniciar modo de exportação visual (CSS)
  document.body.classList.add('is-exporting');
  const exportHeader = document.getElementById('export-header');

  try {
    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // 2. Dar tempo suficiente para o React terminar de "fatiar" a lista de dias 
    // e para as imagens e fontes da página estabilizarem.
    await new Promise(resolve => setTimeout(resolve, 800));

    // 3. Capturar a imagem limpa e focada no que o React gerou (exatamente os 10 compromissos)
    const blob = await toBlob(node, {
      quality: 0.98,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      width: 1000,
      style: {
        transform: 'none',
        width: '1000px',
        margin: '0',
        padding: '30px',
        display: 'block'
      }
    });

    if (!blob) throw new Error('Falha ao gerar imagem');

    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({ files: [file], title: 'Escala Porteiros' });
        return;
      } catch (e) { console.warn('Share nativo falhou'); }
    }

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
    console.error('Erro:', err);
    alert("Erro ao gerar imagem. Tente filtrar um período menor.");
  } finally {
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');
  }
}
