import { toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Versão Robusta: Corta automaticamente escalas gigantes para evitar imagens infinitas.
 */
export async function exportToImage(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) {
    alert("Não foi possível encontrar a escala.");
    return;
  }

  // 1. Identificar se o usuário aplicou algum filtro real no App
  const activeFiltersText = document.getElementById('active-filters-count')?.textContent || "0";
  const isFiltered = parseInt(activeFiltersText) > 0;

  // 2. Localizar todos os cartões de dias da escala
  const allShifts = Array.from(node.querySelectorAll('.group.relative'));

  // 3. Regra de Segurança: Se não houver filtro e houver muita coisa, limitamos a 20 dias
  let forceSlice = false;
  if (!isFiltered && allShifts.length > 20) {
    forceSlice = true;
    const confirmSlice = confirm(
      `Escala muito longa (${allShifts.length} dias). \n\n` +
      "Para a foto não ficar 'gigante' e ilegível no WhatsApp, vamos gerar apenas os PRÓXIMOS 20 DIAS. \n\n" +
      "Dica: Para exportar o mês inteiro, use o filtro de 'Mês' antes."
    );
    if (!confirmSlice) return;
  }

  const exportHeader = document.getElementById('export-header');
  document.body.classList.add('is-exporting');

  // Esconder dias excedentes se for o caso
  if (forceSlice) {
    allShifts.forEach((el, index) => {
      if (index >= 20) (el as HTMLElement).style.display = 'none';
    });
  }

  try {
    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // Esperar renderização de fontes e imagens
    await new Promise(resolve => setTimeout(resolve, 800));

    // Gerar a foto
    const blob = await toBlob(node, {
      quality: 0.9,
      pixelRatio: 2, // Ideal para WhatsApp
      backgroundColor: '#ffffff',
      width: 1000,
      style: {
        transform: 'none',
        width: '1000px',
        margin: '0',
        padding: '40px'
      }
    });

    if (!blob) throw new Error('Falha ao gerar imagem');

    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 📱 MOBILE: Share Nativo
    if (isMobile && navigator.share) {
      try {
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({ files: [file], title: 'Escala Porteiros CCB' });
        return;
      } catch (e) { console.warn('Share falhou'); }
    }

    // 💻 PC: Download com técnica de Blob segura
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
    alert("Erro ao gerar imagem. Tente filtrar por um período menor.");
  } finally {
    // Restaurar a interface para o usuário
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');

    // Voltar a mostrar os dias escondidos na tela do app
    if (forceSlice) {
      allShifts.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    }
  }
}
