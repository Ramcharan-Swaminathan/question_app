import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Checkbox, Card, Button, Chip, useTheme, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuestionStore } from '../store/questionStore';

export default function ReviewScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { questions: initialQuestions } = route.params; // Expecting passed questions

  // State for selection (IDs)
  // By default, select all
  const [selectedIds, setSelectedIds] = useState(initialQuestions.map(q => q.id));
  const { addQuestions } = useQuestionStore();

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = () => {
    const questionsToSave = initialQuestions
      .filter(q => selectedIds.includes(q.id))
      .map(q => ({
        ...q,
        // Initialize SRS data
        nextReview: Date.now(), // Due immediately
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0
      }));

    if (questionsToSave.length === 0) {
      Alert.alert("No Questions Selected", "Please select at least one question to save.");
      return;
    }

    addQuestions(questionsToSave);
    Alert.alert("Success", `${questionsToSave.length} questions added to your bank!`, [
        { text: "OK", onPress: () => navigation.navigate("Main", { screen: "Home" }) }
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.headerRow}>
          <Chip icon="tag" style={styles.chip}>{item.topic}</Chip>
          <Chip icon="speedometer" style={styles.chip}>{item.difficulty}</Chip>
        </View>

        <View style={styles.questionRow}>
          <Checkbox
            status={selectedIds.includes(item.id) ? 'checked' : 'unchecked'}
            onPress={() => toggleSelection(item.id)}
          />
          <Text style={styles.questionText} variant="titleMedium">{item.question}</Text>
        </View>

        <Divider style={{ marginVertical: 10 }} />

        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>Answer: {item.answer}</Text>

        {item.type === 'MCQ' && item.options && (
           <View style={styles.optionsContainer}>
             {item.options.map((opt, idx) => (
                <Text key={idx} variant="bodySmall" style={{ opacity: 0.7 }}>• {opt}</Text>
             ))}
           </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <Text variant="titleMedium">Found {initialQuestions.length} Questions</Text>
        <Text variant="bodySmall">Select questions to add to your deck</Text>
      </View>

      <FlatList
        data={initialQuestions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.actionBar}>
        <Button mode="contained" onPress={handleSave}>
          Save Selected ({selectedIds.length})
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  chip: {
    height: 30,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionText: {
    flex: 1,
    marginLeft: 8,
  },
  optionsContainer: {
    marginTop: 8,
    marginLeft: 8,
  },
  actionBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: 'white', // Should adapt to theme technically, but simple for now
  }
});
