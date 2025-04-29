import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { Layouts } from '@/layouts';

export const App = () => {

    useEffect(() => {
        const handleBeforeUnload = (event: any) => {
            event.preventDefault();
            localStorage.setItem('selected', localStorage.getItem('me') ?? '')
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    return (
        <BrowserRouter>
            <Layouts />
        </BrowserRouter>
    );
};
