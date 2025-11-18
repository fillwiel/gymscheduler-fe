import React, { useState, useEffect, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Header } from './components/Header';
import { DaySelector } from './components/DaySelector';
import { ClassCard } from './components/ClassCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { fetchAllClassData } from './services/gymDataFetcher';
import {signUpForClass, getUserTasks, MEMBER_ID} from './services/api';
import { GymClass, UserTask } from './types';
import {Toaster} from "react-hot-toast";

function App() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Group classes by date
  const groupedClasses = useMemo(() => {
    const grouped = classes.reduce((acc, gymClass) => {
      if (!acc[gymClass.date]) {
        acc[gymClass.date] = [];
      }
      acc[gymClass.date].push(gymClass);
      return acc;
    }, {} as Record<string, GymClass[]>);

    return Object.entries(grouped)
      .map(([date, classes]) => ({
        date,
        classes: classes.sort((a, b) => a.hour.localeCompare(b.hour)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [classes]);

  const availableDates = useMemo(() => {
    return groupedClasses.map(day => day.date);
  }, [groupedClasses]);

  const selectedDayClasses = useMemo(() => {
    return groupedClasses.find(day => day.date === selectedDate)?.classes || [];
  }, [groupedClasses, selectedDate]);

  // Navigation functions for swipe and day selector
  const navigateToNextDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  const navigateToPreviousDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: navigateToNextDay,
    onSwipedRight: navigateToPreviousDay,
    trackMouse: true, // Enable mouse dragging for desktop testing
    preventScrollOnSwipe: true,
    trackTouch: true,
    delta: 50, // Minimum distance for swipe to register
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [classData, tasks] = await Promise.all([
        fetchAllClassData(14),
        getUserTasks(),
      ]);
      
      setClasses(classData);
      setUserTasks(tasks);

    } catch (err) {
      setError('Failed to load gym classes. Please check your connection and try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignUp = async (classData: { id: string; scheduledTime: string }) => {
    try {
      await signUpForClass(classData);
      setUserTasks(prev => {
        const exists = prev.some(task => task.id === classData.id);

        if (exists) {
          return prev.map(task =>
              task.id === classData.id
                  ? { ...task, scheduledTime: classData.scheduledTime }
                  : task
          );
        } else {
          const newTask: UserTask = {
            id: classData.id,
            memberId: MEMBER_ID,
            scheduledTime: classData.scheduledTime,
            processed: false
          };
          return [...prev, newTask];
        }
      });
    } catch (error) {
      throw error;
    }
  };

  const isUserSignedUp = (classId: string) => {
    return userTasks.some(task => task.id === classId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading gym classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />

      <Header selectedDate={selectedDate} />
      
      {availableDates.length > 0 && (
        <DaySelector
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          availableDates={availableDates}
        />
      )}

      <main className="px-4 py-6" {...swipeHandlers}>
        {selectedDayClasses.length === 0 ? (
          <div className="text-center py-12 select-none">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No classes available for this day
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Swipe left or right to browse other days
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto select-none">
            {selectedDayClasses.map((gymClass) => (
              <ClassCard
                key={`${gymClass.id}-${gymClass.date}`}
                gymClass={gymClass}
                isSignedUp={isUserSignedUp(gymClass.id)}
                onSignUp={handleSignUp}
              />
            ))}
            <div className="text-center py-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Swipe left or right to browse other days
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;