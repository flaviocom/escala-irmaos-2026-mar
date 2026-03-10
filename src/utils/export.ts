import { toBlob } from 'html-to-image';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Versão final corrigida para PC (Nome do arquivo) e Mobile (Tamanho e Share).
 */
export async function exportToImage(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) {
    alert("Não foi possível encontrar a escala para exportar.");
    return;
  }

  // 1. RESOLVER PROBLEMA DA IMAGEM GIGANTE (SEM FILTRO)
  // Contamos quantos grupos de dias existem
  const dayGroups = node.querySelectorAll('.group.relative');
  const isFiltered = document.querySelector('.active-filters-count')?.innerHTML !== '0';

  // Se não houver filtro e houver muitos dias, aplicamos uma restrição visual temporária
  if (!isFiltered && dayGroups.length > 20) {
    const proceed = confirm(
      `Sua escala está muito longa (${dayGroups.length} dias). \n\n` +
      "Para evitar que a foto fique 'espremida' ou trave o WhatsApp, " +
      "vamos gerar apenas os PRÓXIMOS 15 DIAS. \n\n" +
      "Se quiser a escala completa, por favor, use o filtro de 'Mês' antes."
    );

    if (!proceed) return;

    // Aplicamos uma classe temporária para esconder os dias distantes na foto
    dayGroups.forEach((group: any) => {
      // Pequeno truque: se não for um dos primeiros 15, escondemos na exportação
      // (Isso é apenas para a foto, não muda a tela do usuário)
      const index = Array.from(dayGroups).indexOf(group);
      if (index > 15) {
        group.classList.add('hide-for-length');
      }
    });
  }

  const exportHeader = document.getElementById('export-header');
  document.body.classList.add('is-exporting');

  try {
    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // Delay para o navegador processar as novas classes
    await new Promise(resolve => setTimeout(resolve, 700));

    // 2. GERAR O ARQUIVO (PNG)
    const blob = await toBlob(node, {
      quality: 1,
      pixelRatio: 2, // 2x é o ideal para WhatsApp (nítido mas não pesado)
      backgroundColor: '#ffffff',
      width: 1000,
      style: {
        transform: 'none',
        width: '1000px',
        margin: '0',
        padding: '30px'
      }
    });

    if (!blob) throw new Error('Falha ao gerar arquivo de imagem');

    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 3. SHARE (MOBILE)
    if (isMobile && navigator.share) {
      try {
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'Escala Porteiros'
        });
        return;
      } catch (e) {
        console.warn('Share nativo falhou, tentando download...', e);
      }
    }

    // 4. DOWNLOAD (PC) - Técnica Robusta para Chrome/Edge no Windows
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Configurações críticas para o PC reconhecer o PNG
    link.href = url;
    link.download = fileName;
    link.dataset.downloadurl = ['image/png', link.download, link.href].join(':');

    document.body.appendChild(link);
    link.click();

    // Limpeza
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);

  } catch (err) {
    console.error('Erro na exportação:', err);
    alert("Não foi possível gerar a imagem. Tente filtrar por um período menor (ex: 15 dias).");
  } finally {
    // Limpar classes temporárias
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');
    dayGroups.forEach((group: any) => group.classList.remove('hide-for-length'));
  }
}
