import { toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Versão ULTRA-ROBUSTA: Agora usa um clone do elemento para garantir o corte físico
 * dos dias excedentes sem afetar a visão do usuário e garantindo o tamanho da imagem.
 */
export async function exportToImage(elementId: string) {
  const originalNode = document.getElementById(elementId);
  if (!originalNode) {
    alert("Não foi possível encontrar a escala.");
    return;
  }

  // 1. Identificar se o usuário aplicou algum filtro real no App
  const activeFiltersText = document.getElementById('active-filters-count')?.textContent || "0";
  const isFiltered = parseInt(activeFiltersText) > 0;

  // 2. Localizar todos os cartões de dias da escala ORIGINAL
  const allShifts = originalNode.querySelectorAll('.group.relative');

  // 3. Regra de Segurança: Se não houver filtro e houver muita coisa, limitamos a 15 dias
  const MAX_GIGANTE = 15;
  let forceSlice = false;

  if (!isFiltered && allShifts.length > MAX_GIGANTE) {
    forceSlice = true;
    const confirmSlice = confirm(
      `Sua escala está muito longa (${allShifts.length} dias). \n\n` +
      "Isso gera aquela imagem 'estrada infinita' que é impossível de ler no WhatsApp. \n\n" +
      "Vamos gerar apenas os PRÓXIMOS 15 DIAS para a imagem ficar nítida. \n\n" +
      "Se precisar da escala completa, por favor, selecione um 'Mês' nos filtros primeiro."
    );
    if (!confirmSlice) return;
  }

  const exportHeader = document.getElementById('export-header');
  document.body.classList.add('is-exporting');

  try {
    // Revelar cabeçalho para a foto
    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // Criar um CLONE para exportação. Assim podemos remover elementos fisicamente
    // sem bugar a tela principal e garantir que a altura da imagem seja recalculada.
    const clone = originalNode.cloneNode(true) as HTMLElement;
    clone.style.width = '1000px';
    clone.style.padding = '40px';
    clone.style.margin = '0';
    clone.style.backgroundColor = '#ffffff';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    document.body.appendChild(clone);

    // Se for escala gigante, remover DIVS físicas do clone
    if (forceSlice) {
      const cloneShifts = clone.querySelectorAll('.group.relative');
      cloneShifts.forEach((el, index) => {
        if (index >= MAX_GIGANTE) {
          el.remove();
        }
      });

      // Se ficaram headers de meses vazios, remover eles também
      const monthContainers = clone.querySelectorAll('.bg-white.rounded-3xl');
      monthContainers.forEach((container) => {
        if (container.querySelectorAll('.group.relative').length === 0) {
          container.remove();
        }
      });
    }

    // Esperar renderização de fontes no clone
    await new Promise(resolve => setTimeout(resolve, 800));

    // Gerar a foto a partir do CLONE
    const blob = await toBlob(clone, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });

    // Limpeza do clone
    document.body.removeChild(clone);

    if (!blob) throw new Error('Falha ao gerar imagem');

    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 📱 MOBILE: Share Nativo
    if (isMobile && navigator.share) {
      try {
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({ files: [file], title: 'Escala Porteiros CCB' });
        return;
      } catch (e) {
        console.warn('Share nativo falhou, tentando download direto...');
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
    console.error('Erro na exportação:', err);
    alert("Houve um erro técnico. Tente filtrar por um período menor.");
  } finally {
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');
  }
}
