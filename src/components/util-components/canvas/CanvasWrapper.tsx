import { ICanvasWrapper } from './canvas.interface';
import { FC } from 'react';

const CanvasWrapper: FC<ICanvasWrapper> = ({
    width,
    height,
    canvasRef,
    dynamicCanvasRef,
    // isEditingArea,
    isEditingLine,
}) => {
    return (
        <div style={{ position: 'relative', width, height, borderRadius: '0.625rem' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 1,
                    borderRadius: '0.625rem',
                }}
            />
            <canvas
                ref={dynamicCanvasRef}
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 2,
                    cursor: isEditingLine ? 'pointer' : 'default',
                    borderRadius: '0.625rem',
                }}
            />
        </div>
    );
};

export default CanvasWrapper;
