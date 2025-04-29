import { Dispatch, SetStateAction, RefObject } from 'react';

interface Point {
    x: number;
    y: number;
}

interface Line {
    start: Point;
    end: Point | null;
}

interface Area {
    points: Point[];
}

interface CanvasProps {
    imageUrl?: string;
    areaPoints: Point[];
    areas: Area[];
    currentLine: Line | null;
    lines: Line[];
    setAreaPoints: Dispatch<SetStateAction<Point[]>>;
    setAreas: Dispatch<SetStateAction<Area[]>>;
    setCoordinates: Dispatch<SetStateAction<Point[]>>;
    setCurrentLine: Dispatch<SetStateAction<Line | null>>;
    setLines: Dispatch<SetStateAction<Line[]>>;
}

interface ICanvasWrapper {
    width: number;
    height: number;
    canvasRef: RefObject<HTMLCanvasElement>;
    dynamicCanvasRef: RefObject<HTMLCanvasElement>;
    isEditingArea: boolean;
    isEditingLine: boolean;
}

interface IControlButtons {
    resetActions: () => void;
    setIsEditingLine: Dispatch<SetStateAction<boolean>>;
    setIsEditingArea: Dispatch<SetStateAction<boolean>>;
    isEditingLine: boolean;
    isEditingArea: boolean;
    width: number;
}

interface ILineEditor {
    isEditingLine: boolean;
    currentLine: Line | null;
    setCurrentLine: Dispatch<SetStateAction<Line | null>>;
    canvasRef: RefObject<HTMLCanvasElement>;
    setLines: Dispatch<SetStateAction<Line[]>>;
    setCurrentPointer: Dispatch<SetStateAction<Point | null>>;
    dynamicCanvasRef: RefObject<HTMLCanvasElement>;
}

interface IAreaEditor {
    areas: Area[];
    canvasRef: RefObject<HTMLCanvasElement>;
    isEditingArea: boolean;
    areaPoints: Point[];
    setAreas: Dispatch<SetStateAction<Area[]>>;
    setAreaPoints: Dispatch<SetStateAction<Point[]>>;
    setCurrentAreaLine: Dispatch<SetStateAction<Point | null>>;
    dynamicCanvasRef: RefObject<HTMLCanvasElement>;
    isPointCloseTo: (point1: Point, point2: Point, additionalProximity?: number) => boolean;
    setCoordinates: Dispatch<SetStateAction<Point[]>>;
    setAreaCoordinates: Dispatch<SetStateAction<(Point | undefined)[][]>>;
    areaCoordinates: (Point | undefined)[][];
}

export type { IAreaEditor, ICanvasWrapper, IControlButtons, ILineEditor, CanvasProps, Point, Line, Area };
