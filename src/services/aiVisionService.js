// src/services/aiVisionService.js
// Servicio de Visión por IA (Google Gemini) para extraer letras y acordes perfectamente

export async function extractSongFromImage(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Image = reader.result;
        
        // Obtenemos la llave directamente desde las variables de entorno de Vite
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        if (!API_KEY) {
          throw new Error('Falta configurar la llave VITE_GEMINI_API_KEY en el archivo .env de la raíz.');
        }

        // Petición directa a la API de Gemini con capacidad Multimodal (Visión)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Analiza esta imagen de una hoja de canto con letra y acordes musicales. Transcribe la canción completa con máxima precisión, corrigiendo cualquier error visual de escaneo. Devuelve la respuesta EXCLUSIVAMENTE en formato JSON plano (sin markdown extra, sin comillas de bloque ```json) con esta estructura exacta: {\"title\": \"NOMBRE DE LA CANCION\", \"artist\": \"AUTOR O MINISTERIO\", \"originalKey\": \"TONO PRINCIPAL EJ G\", \"category\": \"alabanza\", \"lyricsAndChords\": \"La letra completa estructurada con secciones como [Intro], [Verso 1], [Coro] y los acordes colocados exactamente arriba en corchetes ej [G] alineados con la letra.\"}"
                  },
                  {
                    inline_data: {
                      mime_type: imageFile.type || "image/jpeg",
                      data: base64Image.split(',')[1]
                    }
                  }
                ]
              }
            ]
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Error en la respuesta de la API de Google.');
        }

        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
          throw new Error('La IA no pudo procesar la imagen.');
        }

        // Limpieza de formato para asegurar que sea un JSON válido
        const cleanJsonString = candidateText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        const parsedSong = JSON.parse(cleanJsonString);

        resolve({
          title: parsedSong.title || 'NUEVO CANTO',
          artist: parsedSong.artist || 'Ministerio de Alabanza',
          originalKey: parsedSong.originalKey || 'G',
          category: parsedSong.category || 'alabanza',
          lyricsAndChords: parsedSong.lyricsAndChords || ''
        });

      } catch (error) {
        console.error('Error detallado al escanear con IA:', error);
        reject(error);
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(imageFile);
  });
}