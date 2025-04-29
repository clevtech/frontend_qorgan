import AreaEditor from './AreaEditor';
import CanvasWrapper from './CanvasWrapper';
import ControlButtons from './ControlButtons';
import LineEditor from './LineEditor';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './canvas.constants';
import { CanvasProps, Line, Point } from './canvas.interface';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

const COLOR_POINTER: string = '#3e79f7';

const Canvas: FC<CanvasProps> = ({ imageUrl, areaPoints, areas, currentLine, lines, setAreaPoints, setAreas, setCoordinates, setCurrentLine, setLines }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);

    const [isEditingArea, setIsEditingArea] = useState<boolean>(false);
    const [isEditingLine, setIsEditingLine] = useState<boolean>(false);
    const [currentPointer, setCurrentPointer] = useState<{ x: number; y: number } | null>(null);
    const [currentAreaLine, setCurrentAreaLine] = useState<Point | null>(null);
    const [hoverRadius, setHoverRadius] = useState<number>(5);
    const [isHovering, setIsHovering] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    const [areaCoordinates, setAreaCoordinates] = useState<(Point | undefined)[][]>([]);

    const animateHover = useCallback((startRadius: number, endRadius: number, duration: number) => {
        const startTimestamp = performance.now();
        const step = (currentTimestamp: number) => {
            const elapsed = currentTimestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            const currentRadius = startRadius + (endRadius - startRadius) * progress;

            setHoverRadius(currentRadius);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, []);

    const drawCircle = useCallback(
        (context: CanvasRenderingContext2D, position: { x: number; y: number }, radius: number, color: string) => {
            context.beginPath();
            context.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
            context.fillStyle = 'white';
            context.fill();
            context.strokeStyle = color;
            context.stroke();
        },
        [],
    );

    const drawLine = useCallback((context: CanvasRenderingContext2D, line: Line) => {
        if (!line.end) return;
        context.beginPath();
        context.moveTo(line.start.x, line.start.y);
        context.lineTo(line.end.x, line.end.y);
        context.setLineDash([8, 10]);
        context.strokeStyle = COLOR_POINTER;
        context.lineWidth = 2;
        context.stroke();
        context.setLineDash([]);
    }, []);

    function isPointCloseTo(point1: Point, point2: Point, additionalProximity: number = 0) {
        const proximity = 10 + additionalProximity;
        return Math.abs(point1.x - point2.x) < proximity && Math.abs(point1.y - point2.y) < proximity;
    }

    const resetActions = useCallback(() => {
        setLines([]);
        setAreas([]);
        setCurrentLine(null);
        setAreaPoints([]);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setCurrentPointer(null);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (isEditingArea || isEditingLine) {
                setCurrentPointer({ x, y });
            }

            if (isEditingArea) {
                setCurrentAreaLine({ x, y });

                if (areaPoints.length >= 3) {
                    const closeToFirstPoint = isPointCloseTo({ x, y }, areaPoints[0]);

                    if (closeToFirstPoint && !isHovering) {
                        setIsHovering(true);
                        animateHover(5, 10, 300);
                    } else if (!closeToFirstPoint && isHovering) {
                        setIsHovering(false);
                        animateHover(10, 5, 300);
                    }
                } else if (isHovering) {
                    setIsHovering(false);
                    animateHover(hoverRadius, 5, 300);
                }
            }

            if (isEditingLine && currentLine) {
                setCurrentLine((prevLine) => (prevLine ? { ...prevLine, end: { x, y } } : null));
            } else if (isEditingArea) {
                setCurrentAreaLine({ x, y });
            }
        },
        [isEditingArea, isEditingLine, currentLine, areaPoints, isHovering, animateHover, hoverRadius],
    );

    const redraw = useCallback(
        (context: CanvasRenderingContext2D) => {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);

            if (backgroundImage) {
                context.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);
            }

            if (isEditingArea) {
                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
                context.fillRect(0, 0, context.canvas.width, context.canvas.height);

                context.globalCompositeOperation = 'destination-out';
                areas.forEach((area) => {
                    context.beginPath();
                    area.points.forEach((point, index) => {
                        if (index === 0) {
                            context.moveTo(point.x, point.y);
                        } else {
                            context.lineTo(point.x, point.y);
                        }
                    });
                    context.closePath();
                    context.fill();
                });
                context.globalCompositeOperation = 'source-over';
            }

            // Рисуем линии для всех областей
            areas.forEach((area) => {
                area.points.forEach((point, index) => {
                    if (index > 0) {
                        drawLine(context, { start: area.points[index - 1], end: point });
                    }
                });
                // Замыкаем область, если в ней больше одной точки
                if (area.points.length > 1) {
                    drawLine(context, { start: area.points[area.points.length - 1], end: area.points[0] });
                }
            });

            // Рисуем линии для текущей редактируемой области, если точек больше одной
            if (areaPoints.length > 1) {
                areaPoints.forEach((point, index) => {
                    if (index > 0) {
                        drawLine(context, { start: areaPoints[index - 1], end: point });
                    }
                });
                // Рисуем линию от последней точки к текущему положению курсора, если область не замкнута
                if (currentAreaLine) {
                    drawLine(context, { start: areaPoints[areaPoints.length - 1], end: currentAreaLine });
                }
            }

            // Рисуем все остальные линии
            lines.forEach((line) => {
                if (line.start && line.end) {
                    drawLine(context, line);
                }
            });

            // После того как все линии нарисованы, рисуем круги
            lines.forEach((line) => {
                if (line.start && line.end) {
                    drawCircle(context, line.start, 5, COLOR_POINTER);
                    drawCircle(context, line.end, 5, COLOR_POINTER);
                }
            });

            areas.forEach((area) => {
                area.points.forEach((point) => {
                    drawCircle(context, point, 5, COLOR_POINTER);
                });
            });

            areaPoints.forEach((point) => {
                drawCircle(context, point, 5, COLOR_POINTER);
            });
        },
        [
            backgroundImage,
            isEditingArea,
            isEditingLine,
            areas,
            areaPoints,
            lines,
            drawLine,
            currentAreaLine,
            drawCircle,
        ],
    );

    const drawHoverEffect = useCallback(
        (context: CanvasRenderingContext2D) => {
            if (areaPoints.length > 0) {
                drawCircle(context, areaPoints[0], hoverRadius, COLOR_POINTER);
            }
        },
        [areaPoints, hoverRadius, drawCircle],
    );

    useEffect(() => {
        const canvas = dynamicCanvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (currentPointer) {
            drawCircle(context, currentPointer, 5, COLOR_POINTER);
        }

        if (currentLine && currentLine.end) {
            drawLine(context, currentLine);
            drawCircle(context, currentLine.start, 5, COLOR_POINTER);
        }

        if (isEditingArea && currentAreaLine && areaPoints.length > 0) {
            const lastPoint = areaPoints[areaPoints.length - 1];
            drawLine(context, { start: lastPoint, end: currentAreaLine });
        }

        drawHoverEffect(context);
    }, [
        hoverRadius,
        currentPointer,
        drawHoverEffect,
        areaPoints,
        currentLine,
        drawLine,
        isEditingArea,
        currentAreaLine,
        drawCircle,
    ]);

    useEffect(() => {
        if (!imageUrl) return;

        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
            setBackgroundImage(image);

            // if (canvasRef.current) {
            //     canvasRef.current.width = image.width;
            //     canvasRef.current.height = image.height;
            // }

            image.width = CANVAS_WIDTH;
            image.height = CANVAS_HEIGHT;
            setCanvasSize({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
        };
    }, [imageUrl]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        redraw(context);
    }, [redraw, lines]);

    useEffect(() => {
        const canvas = dynamicCanvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseLeave]);

    return (
        <>
            <CanvasWrapper
                width={canvasSize.width}
                height={canvasSize.height}
                canvasRef={canvasRef}
                dynamicCanvasRef={dynamicCanvasRef}
                isEditingArea={isEditingArea}
                isEditingLine={isEditingLine}
            />
            <LineEditor
                isEditingLine={isEditingLine}
                currentLine={currentLine}
                setCurrentLine={setCurrentLine}
                canvasRef={canvasRef}
                setLines={setLines}
                setCurrentPointer={setCurrentPointer}
                dynamicCanvasRef={dynamicCanvasRef}
            />
            <AreaEditor
                isEditingArea={isEditingArea}
                areaPoints={areaPoints}
                setAreaPoints={setAreaPoints}
                canvasRef={canvasRef}
                areas={areas}
                setAreas={setAreas}
                dynamicCanvasRef={dynamicCanvasRef}
                isPointCloseTo={isPointCloseTo}
                setCurrentAreaLine={setCurrentAreaLine}
                setCoordinates={setCoordinates}
                areaCoordinates={areaCoordinates}
                setAreaCoordinates={setAreaCoordinates}
            />
            <ControlButtons
                resetActions={resetActions}
                isEditingArea={isEditingArea}
                isEditingLine={isEditingLine}
                setIsEditingArea={setIsEditingArea}
                setIsEditingLine={setIsEditingLine}
                width={canvasSize.width}
            />
        </>
    );
};

export default Canvas;
