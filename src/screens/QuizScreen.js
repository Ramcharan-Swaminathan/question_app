import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, ProgressBar, useTheme, IconButton } from 'react-native-paper';
import { useQuestionStore } from '../store/questionStore';
import { calculateNextReview, getNextReviewDate } from '../utils/srsLogic';
import { useNavigation } from '@react-navigation/native';

export default function QuizScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { getDueQuestions, updateQuestion } = useQuestionStore();

  const [dueQuestions, setDueQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        const questions = getDueQuestions();
        setDueQuestions(questions);
        setCurrentIndex(0);
        setShowAnswer(false);
        setSessionComplete(false);
    });
    return unsubscribe;
  }, [navigation, getDueQuestions]);

  const handleRate = (rating) => {
    const currentQuestion = dueQuestions[currentIndex];

    const { nextInterval, nextEase, nextRepetitions } = calculateNextReview(
        currentQuestion.interval,
        currentQuestion.easeFactor,
        currentQuestion.repetitions,
        rating
    );

    const nextReviewDate = getNextReviewDate(nextInterval);

    updateQuestion(currentQuestion.id, {
        interval: nextInterval,
        easeFactor: nextEase,
        repetitions: nextRepetitions,
        nextReview: nextReviewDate
    });

    if (currentIndex < dueQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
    } else {
        setSessionComplete(true);
    }
  };

  if (dueQuestions.length === 0 && !sessionComplete) {
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 20 }}>
                No reviews due right now!
            </Text>
            <Text style={{ textAlign: 'center', opacity: 0.6 }}>
                Great job. Check back later or upload more content.
            </Text>
            <Button
                mode="contained"
                style={{ marginTop: 20 }}
                onPress={() => navigation.navigate('Upload')}
            >
                Add New Questions
            </Button>
        </View>
    );
  }

  if (sessionComplete) {
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
             <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 20 }}>
                Session Complete!
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 40 }}>
                You reviewed {dueQuestions.length} questions.
            </Text>
            <Button mode="contained" onPress={() => navigation.navigate('Home')}>
                Back to Home
            </Button>
        </View>
    );
  }

  const question = dueQuestions[currentIndex];
  const progress = (currentIndex + 1) / dueQuestions.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProgressBar progress={progress} color={theme.colors.primary} style={{ height: 6 }} />

      <View style={styles.cardContainer}>
        <Card style={styles.card} mode="elevated">
            <Card.Content>
                <Text variant="labelLarge" style={{ color: theme.colors.secondary, marginBottom: 10 }}>
                    {question.topic} • {question.difficulty}
                </Text>

                <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
                    {question.question}
                </Text>

                {question.type === 'MCQ' && (
                    <View style={{ marginBottom: 20 }}>
                        {question.options.map((opt, i) => (
                            <Text key={i} variant="bodyMedium" style={styles.option}>
                                {String.fromCharCode(65 + i)}. {opt}
                            </Text>
                        ))}
                    </View>
                )}

                {showAnswer && (
                    <View style={styles.answerContainer}>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>Answer:</Text>
                        <Text variant="bodyLarge">{question.answer}</Text>
                    </View>
                )}
            </Card.Content>
        </Card>
      </View>

      <View style={styles.actionContainer}>
        {!showAnswer ? (
            <Button mode="contained" onPress={() => setShowAnswer(true)} contentStyle={{ height: 50 }}>
                Show Answer
            </Button>
        ) : (
            <View style={styles.ratingRow}>
                <Button
                    mode="contained"
                    onPress={() => handleRate('again')}
                    style={{ backgroundColor: '#FF5252', flex: 1, margin: 4 }}
                >
                    Again
                </Button>
                <Button
                    mode="contained"
                    onPress={() => handleRate('hard')}
                    style={{ backgroundColor: '#FFAB40', flex: 1, margin: 4 }}
                >
                    Hard
                </Button>
                <Button
                    mode="contained"
                    onPress={() => handleRate('good')}
                    style={{ backgroundColor: '#69F0AE', flex: 1, margin: 4 }}
                    labelStyle={{ color: 'black' }}
                >
                    Good
                </Button>
                <Button
                    mode="contained"
                    onPress={() => handleRate('easy')}
                    style={{ backgroundColor: '#40C4FF', flex: 1, margin: 4 }}
                >
                    Easy
                </Button>
            </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    minHeight: 300,
    justifyContent: 'center',
  },
  option: {
    marginVertical: 4,
    marginLeft: 10,
  },
  answerContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
