import { ILineEditor, Line } from './canvas.interface';
import { FC, useCallback, useEffect } from 'react';

const LineEditor: FC<ILineEditor> = ({
    isEditingLine,
    currentLine,
    setCurrentLine,
    canvasRef,
    setLines,
    setCurrentPointer,
    dynamicCanvasRef,
}) => {
    const handleLineClick = useCallback(
        (e: MouseEvent) => {
            if (!canvasRef.current || !isEditingLine) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (!currentLine) {
                setCurrentLine({ start: { x, y }, end: null });
            } else {
                setLines((prevLines: Line[]) => [...prevLines, { ...currentLine, end: { x, y } }]);
                setCurrentLine(null);
                setCurrentPointer(null);
            }
        },
        [canvasRef, isEditingLine, currentLine, setCurrentLine, setLines, setCurrentPointer],
    );

    useEffect(() => {
        if (!isEditingLine && currentLine) {
            setCurrentLine(null);
        }
    }, [isEditingLine, currentLine, setCurrentLine]);

    useEffect(() => {
        const canvas = dynamicCanvasRef.current;
        if (!canvas) return;

        if (isEditingLine) {
            canvas.addEventListener('click', handleLineClick);
        }
        return () => {
            canvas.removeEventListener('click', handleLineClick);
        };
    }, [dynamicCanvasRef, handleLineClick, isEditingLine]);

    return null;
};

export default LineEditor;
