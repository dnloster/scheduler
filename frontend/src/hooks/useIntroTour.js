import { useState, useEffect } from "react";
import introService from "../services/introService";

const TOUR_STORAGE_KEY = "scheduler_tours_completed";

export const useIntroTour = () => {
    const [tourCompleted, setTourCompleted] = useState({});

    useEffect(() => {
        // Load completed tours from localStorage
        const completed = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || "{}");
        setTourCompleted(completed);
    }, []);

    const markTourCompleted = (tourName) => {
        const updated = {
            ...tourCompleted,
            [tourName]: true,
        };
        setTourCompleted(updated);
        localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(updated));
    };

    const resetTours = () => {
        setTourCompleted({});
        localStorage.removeItem(TOUR_STORAGE_KEY);
    };

    const isTourCompleted = (tourName) => {
        return tourCompleted[tourName] === true;
    };

    const startTour = (tourName, customSteps = null) => {
        let tourPromise;

        switch (tourName) {
            case "dashboard":
                tourPromise = introService.startDashboardTour();
                break;
            case "course":
                tourPromise = introService.startCourseTour();
                break;
            case "schedule":
                tourPromise = introService.startScheduleTour();
                break;
            case "quick":
                tourPromise = introService.startQuickTour();
                break;
            case "custom":
                if (customSteps) {
                    tourPromise = introService.startCustomTour(customSteps);
                }
                break;
            default:
                console.warn(`Unknown tour: ${tourName}`);
                return;
        }

        if (tourPromise) {
            introService
                .onComplete(() => {
                    markTourCompleted(tourName);
                })
                .onExit(() => {
                    // Tour was skipped or exited
                    console.log(`Tour ${tourName} was exited`);
                });
        }
    };

    return {
        tourCompleted,
        isTourCompleted,
        markTourCompleted,
        resetTours,
        startTour,
    };
};

export default useIntroTour;
