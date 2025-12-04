import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Switch, List, RadioButton, Button, useTheme } from 'react-native-paper';
import { useSettingsStore } from '../store/settingsStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    apiKey, setApiKey,
    isDarkMode, toggleTheme,
    notificationFrequency, setNotificationFrequency,
    preferredDifficulty, setPreferredDifficulty
  } = useSettingsStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.header}>Settings</Text>

        <List.Section title="General">
          <List.Item
            title="Dark Mode"
            right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
          />
        </List.Section>

        <List.Section title="API Configuration">
          <View style={styles.inputContainer}>
            <TextInput
              label="Gemini API Key"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              mode="outlined"
            />
            <Text variant="bodySmall" style={styles.helperText}>
              Required for question generation.
            </Text>
          </View>
        </List.Section>

        <List.Section title="Preferences">
          <List.Accordion title="Notification Frequency" expanded={true}>
            <RadioButton.Group onValueChange={setNotificationFrequency} value={notificationFrequency}>
              <RadioButton.Item label="Daily" value="daily" />
              <RadioButton.Item label="Weekly" value="weekly" />
            </RadioButton.Group>
          </List.Accordion>

          <List.Accordion title="Preferred Difficulty" expanded={true}>
            <RadioButton.Group onValueChange={setPreferredDifficulty} value={preferredDifficulty}>
              <RadioButton.Item label="Easy" value="easy" />
              <RadioButton.Item label="Medium" value="medium" />
              <RadioButton.Item label="Hard" value="hard" />
            </RadioButton.Group>
          </List.Accordion>
        </List.Section>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  helperText: {
    marginTop: 4,
    opacity: 0.6,
  }
});
