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
  const theme = isDarkMode ? AppDarkTheme : AppLightTheme;

  // Notification Scheduling Logic
  // We check if there are due questions and schedule a reminder.
  // In a real app, we would use BackgroundFetch to check periodically.
  // Here we schedule "next review" when the app opens or settings change.

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Simple logic: If frequency is daily, schedule a notification for tomorrow same time
    // OR if there are due questions now, schedule one for "later today" (e.g. 6 hours).

    // For demo purposes, we will schedule a notification 10 seconds after app load
    // IF there are due items, just to show it works?
    // No, that's annoying.

    // Real logic:
    // If user wants 'Daily' reminders, we set a repeating notification.
    // However, the prompt asked for "periodic like give notification to answer some question based on the upload".
    // We can interpret this as: "If I have cards due, remind me".

    const scheduleReminder = async () => {
         // Cancel all previous to avoid spam
         // await Notifications.cancelAllScheduledNotificationsAsync();

         // If we wanted to be sophisticated, we'd look at the earliest `nextReview` date in the store.
         // Let's do that.
         const questions = useQuestionStore.getState().questions;
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

  }, [notificationFrequency]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
