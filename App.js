import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/store/settingsStore';
import { useQuestionStore } from './src/store/questionStore';
import { AppLightTheme, AppDarkTheme } from './src/theme';
import { registerForPushNotificationsAsync, scheduleNotification } from './src/services/notificationService';

export default function App() {
  const { isDarkMode, notificationFrequency } = useSettingsStore();
  // Select questions so component re-renders and effect re-runs when they change
  const questions = useQuestionStore(state => state.questions);
  const theme = isDarkMode ? AppDarkTheme : AppLightTheme;

  // Notification Scheduling Logic
  // We check if there are due questions and schedule a reminder.
  // In a real app, we would use BackgroundFetch to check periodically.
  // Here we schedule "next review" when the app opens, settings change, or questions are updated.

  useEffect(() => {
    registerForPushNotificationsAsync();

    const scheduleReminder = async () => {
         // If we wanted to be sophisticated, we'd look at the earliest `nextReview` date in the store.
         if (questions.length === 0) return;

         const now = Date.now();
         const dueCount = questions.filter(q => q.nextReview <= now).length;

         if (dueCount > 0) {
             // Already due? Remind in 6 hours (21600 seconds) if they haven't cleared it by then.
             await scheduleNotification(21600);
         } else {
             // Find next due date
             const nextDue = Math.min(...questions.map(q => q.nextReview));
             const delaySeconds = (nextDue - now) / 1000;
             if (delaySeconds > 0) {
                 // Schedule for that time
                 await scheduleNotification(delaySeconds);
             }
         }
    };

    scheduleReminder();

  }, [notificationFrequency, questions]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
