import { Button } from 'antd';
import { IControlButtons } from './canvas.interface';
import { FC } from 'react';

const ControlButtons: FC<IControlButtons> = ({
    resetActions,
    setIsEditingArea,
    setIsEditingLine,
    // isEditingLine,
    isEditingArea,
    width,
}) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: width }}>
            <Button danger className='btn-canvas' onClick={resetActions}>
                Сбросить все
            </Button>
            <div style={{ display: 'flex', gap: '8px' }}>
                {/* <button
                    className='btn-canvas'
                    onClick={() => {
                        setIsEditingLine((prev) => !prev);
                        setIsEditingArea(false);
                    }}
                >
                    {isEditingLine ? 'Закончить рисовку' : 'Добавить линию'}
                </button> */}
                <Button
                    className='btn-canvas'
                    onClick={() => {
                        setIsEditingArea((prev) => !prev);
                        setIsEditingLine(false);
                    }}
                    type={isEditingArea ? 'default' : 'primary'}
                >
                    {isEditingArea ? 'Закончить выделение' : 'Выделить область'}
                </Button>
            </div>
        </div>
    );
};

export default ControlButtons;
