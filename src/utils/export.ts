import { toBlob } from 'html-to-image';
import { format } from 'date-fns';

/**
 * Função para exportar a escala como imagem.
 * Agora utiliza processamento em Blob e garante o download em todos os dispositivos.
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

    // Pequeno delay para garantir que o DOM atualizou as classes de visualização
    await new Promise(resolve => setTimeout(resolve, 300));

    // Gerar o Blob da imagem (PNG é mais estável para escala de texto)
    const blob = await toBlob(node, {
      quality: 1,
      pixelRatio: 3, // Qualidade alta para impressão/leitura
      backgroundColor: '#ffffff',
      // Forçamos o layout a se comportar como desktop durante o "print"
      style: {
        transform: 'scale(1)',
        width: '1000px', // Largura ideal para caber as 3 colunas (Data -> Turno -> Irmãos)
        margin: '0',
        padding: '30px'
      },
      width: 1000,
      filter: (domNode) => {
        // Filtra elementos que não devem ir para a foto (como o botão flutuante)
        return !domNode.classList?.contains('hide-on-export');
      }
    });

    if (!blob) throw new Error('Falha ao gerar o arquivo de imagem.');

    // Criar o link de download de forma robusta
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Nome do arquivo sem espaços ou caracteres especiais para evitar problemas em mobiles
    const fileName = `escala-irmaos-${format(new Date(), 'dd-MM-yyyy')}.png`;

    link.style.display = 'none';
    link.href = url;
    link.download = fileName;

    // Obrigatório no Firefox e alguns Androids
    document.body.appendChild(link);
    link.click();

    // Limpeza
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 200);

  } catch (err) {
    console.error('Erro ao exportar:', err);
    alert("Ocorreu um erro ao gerar a escala. Se o problema persistir, tente tirar um print da tela.");
  } finally {
    // Restaurar interface original
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }
    document.body.classList.remove('is-exporting');
  }
}
