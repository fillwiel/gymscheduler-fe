import React, {useState} from 'react';
import {Clock, Users, CheckCircle} from 'lucide-react';
import {GymClass} from '../types';
import {LoadingSpinner} from './LoadingSpinner';

interface ClassCardProps {
    gymClass: GymClass;
    isSignedUp: boolean;
    onSignUp: (classData: { id: string; scheduledTime: string }) => Promise<void>;
}

export const ClassCard: React.FC<ClassCardProps> = ({
                                                        gymClass,
                                                        isSignedUp,
                                                        onSignUp,
                                                    }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        if (isSignedUp || !gymClass.scheduledTime) return;

        setIsLoading(true);
        try {
            await onSignUp({
                id: gymClass.id,
                scheduledTime: gymClass.scheduledTime,
            });
        } catch (error) {
            console.error('Failed to sign up:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const availabilityColor = () => {
        const num = parseInt(gymClass.availabilityNumber);
        if (num === 0) return 'text-red-500';
        if (num <= 3) return 'text-orange-500';
        return 'text-green-500';
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 animate-fade-in">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                        {/*TODO za cholere nie moge odczytac issignedup*/}
                        {gymClass.title} signedup: {isSignedUp}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4"/>
                            <span>{gymClass.hour}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4"/>
                            <span className={`font-medium ${availabilityColor()}`}>
                {gymClass.availabilityNumber} spots
              </span>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 ml-4">
                    {isSignedUp ? (
                        <div
                            className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                            <CheckCircle className="w-4 h-4"/>
                            <span className="text-sm font-medium">Signed Up</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleSignUp}
                            disabled={isSignedUp}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
                bg-yellow-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md active:scale-95`}
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner size="sm"/>
                                    <span>Signing up...</span>
                                </>
                            ) : (
                                <span>Sign Up</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};