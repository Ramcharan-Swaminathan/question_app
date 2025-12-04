import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator, useTheme, ProgressBar } from 'react-native-paper';
import { pickDocument, extractTextFromFile } from '../utils/fileHandler';
import { generateQuestions } from '../services/geminiService'; // We will create this next
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '../store/settingsStore';

export default function UploadScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { apiKey } = useSettingsStore();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const handlePickDocument = async () => {
    const result = await pickDocument();
    if (result) {
      setFile(result);
      setLoading(true);
      try {
        const text = await extractTextFromFile(result.uri, result.mimeType);
        setExtractedText(text);
      } catch (error) {
        Alert.alert("Error", "Failed to extract text from file.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      Alert.alert("Missing API Key", "Please go to settings and configure your Gemini API Key.");
      return;
    }
    if (!extractedText) {
      Alert.alert("No Content", "Please upload a file first.");
      return;
    }

    setLoading(true);
    try {
        // We will pass the text to the review screen via navigation params or a temporary store
        // But for better UX, let's generate here and then navigate.
        const questions = await generateQuestions(extractedText, apiKey);
        navigation.navigate('Review', { questions });
    } catch (error) {
        Alert.alert("Generation Failed", error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>Upload Content</Text>
        <Text style={styles.subtitle}>Select a PDF or Doc to generate questions.</Text>

        <Card style={styles.card} mode="outlined">
          <Card.Content>
            {file ? (
              <View style={styles.fileInfo}>
                <Text variant="titleMedium" numberOfLines={1}>{file.name}</Text>
                <Text variant="bodySmall">{(file.size / 1024).toFixed(1)} KB</Text>
              </View>
            ) : (
              <Text style={{ textAlign: 'center', color: theme.colors.outline }}>No file selected</Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button mode="contained-tonal" onPress={handlePickDocument} icon="file-upload">
              Pick Document
            </Button>
          </Card.Actions>
        </Card>

        {loading && <ActivityIndicator animating={true} style={styles.loader} size="large" />}

        {extractedText ? (
            <View style={styles.preview}>
                <Text variant="labelLarge">File Ready:</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {extractedText.isBinary
                        ? "Binary file prepared for Gemini (Base64)"
                        : extractedText.content.substring(0, 200) + "..."
                    }
                </Text>
            </View>
        ) : null}

        <View style={styles.actionContainer}>
           <Button
             mode="contained"
             onPress={handleGenerate}
             disabled={!extractedText || loading}
             contentStyle={{ height: 50 }}
           >
             Generate Questions
           </Button>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  card: {
    marginBottom: 20,
  },
  fileInfo: {
    alignItems: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  preview: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  actionContainer: {
    marginTop: 10,
  }
});
