import { toPng, toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Versão ultra-compatível para PC (download com nome) e Mobile (compartilhamento).
 */
export async function exportToImage(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) {
    alert("Não foi possível encontrar a escala para exportar.");
    return;
  }

  // Trava para escalas gigantes que travam o navegador
  const shiftElements = node.querySelectorAll('.group.relative');
  if (shiftElements.length > 50) {
    const confirmLong = confirm(
      `Escala muito longa (${shiftElements.length} dias). \n\n` +
      "Isso pode falhar no PC ou Celular. \n\n" +
      "Deseja continuar? Recomenda-se filtrar por 'Mês' antes."
    );
    if (!confirmLong) return;
  }

  const exportHeader = document.getElementById('export-header');
  document.body.classList.add('is-exporting');

  try {
    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // Esperar renderização completa
    await new Promise(resolve => setTimeout(resolve, 600));

    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Configurações comuns de imagem
    const imageOptions = {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: 1000,
      style: {
        transform: 'none',
        width: '1000px',
        margin: '0',
        padding: '30px'
      }
    };

    if (isMobile && navigator.share) {
      // 📱 MOBILE: Gera BLOB para compartilhar nativamente
      const blob = await toBlob(node, imageOptions);
      if (!blob) throw new Error('Falha ao gerar imagem mobile');

      const file = new File([blob], fileName, { type: 'image/png' });
      const shareData = { title: 'Escala Porteiros CCB', files: [file] };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    }

    // 💻 PC ou FALLBACK MOBILE: Gera DataURL (Base64) - Mais seguro para nome de arquivo no PC
    const dataUrl = await toPng(node, imageOptions);
    if (!dataUrl) throw new Error('Falha ao gerar imagem PC');

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = dataUrl;
    link.download = fileName; // Força o nome do arquivo com .png

    document.body.appendChild(link);
    link.click();

    // Limpeza
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);

  } catch (err) {
    console.error('Erro ao exportar:', err);
    alert("Erro ao gerar imagem. Tente filtrar por um período menor.");
  } finally {
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');
  }
}
