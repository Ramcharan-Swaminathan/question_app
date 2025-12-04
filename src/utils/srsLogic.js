/**
 * Calculates the next review schedule using a modified SM-2 algorithm.
 *
 * @param {number} currentInterval - Current interval in days.
 * @param {number} currentEase - Current ease factor.
 * @param {number} repetitions - Number of consecutive correct answers.
 * @param {number} grade - User rating (0: Again, 1: Hard, 2: Good, 3: Easy) - Note: standard SM-2 uses 0-5
 *
 * Mapping for this app:
 * "Again" -> Grade 1 (Complete blackout)
 * "Hard"  -> Grade 3 (Remembered with difficulty)
 * "Good"  -> Grade 4 (OK)
 * "Easy"  -> Grade 5 (Perfect)
 *
 * @returns {object} { nextInterval, nextEase, nextRepetitions }
 */
export const calculateNextReview = (currentInterval, currentEase, repetitions, gradeKey) => {
    let grade;
    switch(gradeKey) {
        case 'again': grade = 1; break;
        case 'hard': grade = 3; break;
        case 'good': grade = 4; break;
        case 'easy': grade = 5; break;
        default: grade = 3;
    }

    let nextInterval;
    let nextEase = currentEase;
    let nextRepetitions = repetitions;

    if (grade >= 3) {
        if (repetitions === 0) {
            nextInterval = 1;
        } else if (repetitions === 1) {
            nextInterval = 6;
        } else {
            nextInterval = Math.round(currentInterval * currentEase);
        }
        nextRepetitions++;
    } else {
        nextRepetitions = 0;
        nextInterval = 1;
    }

    // Update Ease Factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    nextEase = currentEase + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (nextEase < 1.3) nextEase = 1.3;

    return {
        nextInterval, // in days
        nextEase,
        nextRepetitions
    };
};

export const getNextReviewDate = (intervalInDays) => {
    return Date.now() + intervalInDays * 24 * 60 * 60 * 1000;
};
