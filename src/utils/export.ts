import { toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Implementa suporte a compartilhamento nativo em smartphones e download no PC.
 */
export async function exportToImage(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) {
    alert("Não foi possível encontrar a escala para exportar.");
    return;
  }

  // Previne cliques duplos e indica processamento
  const exportHeader = document.getElementById('export-header');
  document.body.classList.add('is-exporting');

  try {
    // Revelar cabeçalho CCB para a foto
    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // Delay para garantir que o DOM atualizou as classes e imagens (logo)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Gerar o Blob da imagem
    const blob = await toBlob(node, {
      quality: 1,
      pixelRatio: 2.5, // Equilíbrio entre qualidade e tamanho de arquivo
      backgroundColor: '#ffffff',
      style: {
        transform: 'scale(1)',
        width: '1000px',
        margin: '0',
        padding: '30px'
      },
      width: 1000
    });

    if (!blob) throw new Error('Falha ao gerar o arquivo de imagem.');

    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;

    // 🆕 COMPARTILHAMENTO NATIVO (MOBILE)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      const file = new File([blob], fileName, { type: 'image/png' });

      const shareData = {
        title: 'Escala de Porteiros',
        text: 'Segue a escala de serviço.',
        files: [file]
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          // Sucesso no compartilhamento nativo!
          return;
        } catch (err) {
          // Se o usuário cancelar ou o share falhar, continuamos para o download como fallback
          if ((err as Error).name !== 'AbortError') {
            console.error('Erro no compartilhamento nativo:', err);
          }
        }
      }
    }

    // ⬇️ DOWNLOAD TRADICIONAL (PC ou fallback mobile)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.style.display = 'none';
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    // Limpeza
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 200);

  } catch (err) {
    console.error('Erro ao exportar:', err);
    alert("Ocorreu um erro ao gerar a escala. Tente novamente ou tire um print da tela.");
  } finally {
    // Restaurar interface original
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');
  }
}
