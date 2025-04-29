import { useEffect } from 'react';

const addBodyClass = (className: string) => {
    document.body.classList.add(className);
};

const removeBodyClass = (className: string) => {
    document.body.classList.remove(className);
};

export const useBodyClass = (className: string | string[]) => {
    useEffect(() => {
        if (Array.isArray(className)) {
            className.forEach(addBodyClass);
        } else {
            addBodyClass(className);
        }

        return () => {
            if (Array.isArray(className)) {
                className.forEach(removeBodyClass);
            } else {
                removeBodyClass(className);
            }
        };
    }, [className]);
};
