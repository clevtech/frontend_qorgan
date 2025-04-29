import { CANVAS_HEIGHT, CANVAS_WIDTH } from './canvas.constants';
import { Area, IAreaEditor, Point } from './canvas.interface';
import { FC, useCallback, useEffect } from 'react';

const AreaEditor: FC<IAreaEditor> = ({
    canvasRef,
    isEditingArea,
    areaPoints,
    setAreas,
    setAreaPoints,
    setCurrentAreaLine,
    dynamicCanvasRef,
    isPointCloseTo,
    setCoordinates,
    areas,
    setAreaCoordinates,
}) => {
    useEffect(() => {
        const convertedAreas = areas.map((area: Area) => {
            return area.points.map((point: Point) => {
                if (!canvasRef.current || !isEditingArea) return;
                const x = point.x / CANVAS_WIDTH;
                const y = point.y / CANVAS_HEIGHT;
                return { x, y };
            });
        });

        setAreaCoordinates(convertedAreas);
    }, [areas, canvasRef, isEditingArea, setAreaCoordinates]);

    const handleAreaClick = useCallback(
        (e: MouseEvent) => {
            if (!canvasRef.current || !isEditingArea) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Округление до ближайшего большего целого числа перед сохранением в состояние
            const roundedX = Math.ceil(x);
            const roundedY = Math.ceil(y);

            // Получаем размеры холста
            const canvasWidth = canvasRef.current.width;
            const canvasHeight = canvasRef.current.height;

            // Вычисляем относительные координаты
            const relativeX = roundedX / canvasWidth;
            const relativeY = roundedY / canvasHeight;

            if (areaPoints.length >= 3 && isPointCloseTo({ x: roundedX, y: roundedY }, areaPoints[0])) {
                setAreas((prevAreas: Area[]) => [...prevAreas, { points: areaPoints }]);
                setAreaPoints([]);
                setCurrentAreaLine(null);
                // Также очищаем координаты
            } else {
                setAreaPoints((prevPoints: Point[]) => [...prevPoints, { x: roundedX, y: roundedY }]);
                // Сохраняем относительные координаты
                setCoordinates((prevCoordinates: Point[]) => {
                    if (Array.isArray(prevCoordinates)) {
                        return [...prevCoordinates, { x: relativeX, y: relativeY }];
                    } else {
                        return [{ x: relativeX, y: relativeY }];
                    }
                });
            }
        },
        [
            canvasRef,
            isEditingArea,
            areaPoints,
            isPointCloseTo,
            setAreas,
            setAreaPoints,
            setCurrentAreaLine,
            setCoordinates,
        ],
    );

    useEffect(() => {
        if (!isEditingArea && areaPoints.length > 0 && areaPoints.length < 3) {
            setAreaPoints([]);
        }
    }, [isEditingArea, areaPoints, setAreaPoints]);

    useEffect(() => {
        const canvas = dynamicCanvasRef.current;
        if (!canvas) return;

        if (isEditingArea) {
            canvas.addEventListener('click', handleAreaClick);
        }

        return () => {
            canvas.removeEventListener('click', handleAreaClick);
        };
    }, [dynamicCanvasRef, handleAreaClick, isEditingArea]);

    return null;
};

export default AreaEditor;
