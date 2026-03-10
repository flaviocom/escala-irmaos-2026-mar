import { toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Ajustada para evitar imagens infinitamente longas e falhas no PC.
 */
export async function exportToImage(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) {
    alert("Não foi possível encontrar a escala para exportar.");
    return;
  }

  // Se a escala for MUITO longa (mais de 100 turnos), avisar o usuário
  const shiftElements = node.querySelectorAll('.group.relative');
  if (shiftElements.length > 50) {
    const confirmLong = confirm(
      `Você está tentando gerar uma imagem com ${shiftElements.length} dias de escala. \n\n` +
      "Isso pode demorar ou falhar no celular. \n\n" +
      "Deseja continuar? (Dica: Use os filtros de 'Mês' ou '15 dias' para imagens menores)."
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

    // Delay maior para garantir renderização de fontes e logos
    await new Promise(resolve => setTimeout(resolve, 800));

    // Gerar o Blob da imagem
    // Reduzimos o pixelRatio para 2 para evitar estourar o limite de memória do navegador em listas longas
    const blob = await toBlob(node, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      style: {
        transform: 'none',
        width: '1000px', // Força largura Desktop
        maxWidth: '1000px',
        margin: '0',
        padding: '40px',
        // Reseta restrições de layout que podem vir do Tailwind
        display: 'block',
        height: 'auto'
      },
      width: 1000
    });

    if (!blob) throw new Error('Falha ao gerar o arquivo de imagem.');

    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;

    // 📱 MOBILE: Compartilhamento Nativo
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      const file = new File([blob], fileName, { type: 'image/png' });
      const shareData = {
        title: 'Escala de Porteiros',
        files: [file]
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    }

    // 💻 PC: Download Direto
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Limpeza rigorosa
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 500);

  } catch (err) {
    console.error('Erro ao exportar:', err);
    alert("A imagem é muito grande para este aparelho. \n\nTente filtrar por 'Mês' ou '15 dias' antes de enviar.");
  } finally {
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');
  }
}
