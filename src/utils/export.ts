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

    // Force styles for rendering (temporarily remove scroll limits, fix bg, etc)
    const prevMaxHeight = node.style.maxHeight;
    const prevOverflow = node.style.overflow;

    // Create the image
    const dataUrl = await toJpeg(node, {
      quality: 0.95,
      backgroundColor: '#f9fafb', // matches gray-50 or custom background
      style: {
        margin: '0',
        padding: '24px',
        maxWidth: '800px'
      }
    });

    // Hide the header back
    if (exportHeader) {
      exportHeader.classList.add('hidden');
      exportHeader.classList.remove('flex');
    }

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
