import { toJpeg } from 'html-to-image';
import { format } from 'date-fns';

export async function exportToImage(elementId: string) {
  try {
    const node = document.getElementById(elementId);
    if (!node) {
      alert("Não foi possível encontrar a escala para exportar.");
      return;
    }

    // Reveal the hidden header for the export output
    const exportHeader = document.getElementById('export-header');
    if (exportHeader) {
      exportHeader.classList.remove('hidden');
      exportHeader.classList.add('flex');
    }

    // Add class to hide elements that shouldn't be exported
    document.body.classList.add('is-exporting');

    // Force styles for rendering (temporarily remove scroll limits, fix bg, etc)
    const prevMaxHeight = node.style.maxHeight;
    const prevOverflow = node.style.overflow;

    // Create the image
    const dataUrl = await toJpeg(node, {
      quality: 0.95,
      pixelRatio: 2, // Garante que não fique pixelado no zoom
      width: 800, // Força a largura do canvas para não quebrar layout de celular
      backgroundColor: '#f9fafb', // matches gray-50 or custom background
      style: {
        margin: '0',
        padding: '24px',
        width: '800px', // Força a renderização com layout Desktop
        maxWidth: 'none'
      }
    });

    // Hide the header back
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }

    // Remove exporting class
    document.body.classList.remove('is-exporting');

    // Create a download link
    const link = document.createElement('a');
    link.download = `escala_porteiros_${format(new Date(), 'dd_MM_yyyy')}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Erro ao gerar imagem', err);
    alert("Houve um erro ao tentar gerar a imagem.");
  }
}
