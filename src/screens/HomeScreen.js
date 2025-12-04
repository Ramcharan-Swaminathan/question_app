import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import { useQuestionStore } from '../store/questionStore';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { getStats, getDueQuestions } = useQuestionStore(); // Trigger re-render on store change?
  // Note: zustand default hook subscribes to state changes, but getStats is a function.
  // We need to select state to subscribe.
  const stats = useQuestionStore(state => {
      const total = state.questions.length;
      const due = state.questions.filter(q => q.nextReview <= Date.now()).length;
      return { total, due };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
           FlashMinds
        </Text>
        <Text variant="bodyLarge">Master your knowledge</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
            <Card.Content style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="cards-outline" size={32} color={theme.colors.secondary} />
                <Title>{stats.total}</Title>
                <Paragraph>Total Cards</Paragraph>
            </Card.Content>
        </Card>

        <Card style={[styles.statCard, { borderColor: theme.colors.error }]}>
            <Card.Content style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name="clock-alert-outline" size={32} color={theme.colors.error} />
                <Title style={{ color: theme.colors.error }}>{stats.due}</Title>
                <Paragraph>Due Now</Paragraph>
            </Card.Content>
        </Card>
      </View>

      <View style={styles.actions}>
         <Button
            mode="contained"
            icon="play-circle-outline"
            contentStyle={{ height: 60 }}
            labelStyle={{ fontSize: 18 }}
            onPress={() => navigation.navigate('Quiz')}
            disabled={stats.due === 0}
         >
            Start Quiz
         </Button>

         <Button
            mode="contained-tonal"
            icon="plus"
            style={{ marginTop: 20 }}
            onPress={() => navigation.navigate('Upload')}
         >
            Add New Content
         </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    width: '48%',
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-start',
  }
});
