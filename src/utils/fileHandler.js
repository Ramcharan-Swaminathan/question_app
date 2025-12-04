import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return asset;
  } catch (err) {
    console.error("Error picking document", err);
    return null;
  }
};

/**
 * Prepares the file for Gemini.
 * Returns an object { content, mimeType, isBinary }
 */
export const extractTextFromFile = async (fileUri, mimeType) => {
  try {
    // Basic text file
    if (mimeType === 'text/plain') {
        const text = await FileSystem.readAsStringAsync(fileUri);
        return { content: text, mimeType, isBinary: false };
    }

    // For PDF and Docx, we read as Base64 and pass to Gemini
    // Gemini 1.5 Flash supports PDF input via Base64.
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
    });

    return { content: base64, mimeType, isBinary: true };

  } catch (error) {
    console.error("Error reading file", error);
    throw error;
  }
};
