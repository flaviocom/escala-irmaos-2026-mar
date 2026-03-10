import { toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 */
export async function exportToImage(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) return;

  // 1. Identificar se houver filtros de mês ou data (filtros que limitam o tempo)
  const activeFilters = parseInt(document.getElementById('active-filters-count')?.textContent || "0");

  // 2. Contar itens na escala
  const allItems = node.querySelectorAll('.export-item');
  const totalItems = allItems.length;

  // 3. Regra de Ouro: Se a imagem for ficar muito grande (mais de 25 dias), 
  // nós SEMPRE limitamos para os primeiros 20 dias para evitar a "tira infinita".
  let forceLimit = false;

  if (totalItems > 25) {
    forceLimit = true;
    const confirmLimit = confirm(
      `Escala muito longa (${totalItems} dias). \n\n` +
      "Para que a foto fique nítida e legível no WhatsApp, vamos gerar apenas os primeiros 20 dias. \n\n" +
      "Dica: Para ver o mês inteiro, use o filtro de 'Mês' antes de exportar."
    );
    if (!confirmLimit) return;
  }

  // 4. Iniciar modo de exportação
  document.body.classList.add('is-exporting');

  let itemsToHide: HTMLElement[] = [];
  let containersToHide: HTMLElement[] = [];

  const exportHeader = document.getElementById('export-header');

  try {
    if (forceLimit) {
      // 5. Ocultar manualmente os dias após o limite no DOM vivo, para o html-to-image respeitar de verdade
      allItems.forEach((el, index) => {
        if (index >= 20) {
          const htmlEl = el as HTMLElement;
          htmlEl.style.setProperty('display', 'none', 'important');
          itemsToHide.push(htmlEl);
        }
      });

      // Ocultar os contêineres de meses que ficaram vazios após o corte
      const monthContainers = node.querySelectorAll('.month-container');
      monthContainers.forEach(container => {
        const visibleItems = Array.from(container.querySelectorAll('.export-item'))
          .filter(el => (el as HTMLElement).style.display !== 'none');
        if (visibleItems.length === 0) {
          const htmlContainer = container as HTMLElement;
          htmlContainer.style.setProperty('display', 'none', 'important');
          containersToHide.push(htmlContainer);
        }
      });
    }

    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // Esperar um pouco mais para garantir que o layout CSS do "is-exporting" aplicou
    await new Promise(resolve => setTimeout(resolve, 800));

    const blob = await toBlob(node, {
      quality: 0.95,
      pixelRatio: 2,
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

    // Restaurar a visibilidade original dos itens ocultados manualmente
    if (forceLimit) {
      itemsToHide.forEach(el => el.style.removeProperty('display'));
      containersToHide.forEach(el => el.style.removeProperty('display'));
    }

    document.body.classList.remove('is-exporting');
  }
}
