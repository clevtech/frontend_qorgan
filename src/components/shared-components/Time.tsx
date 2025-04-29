import { Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Text } = Typography;

export const Time = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const gmtOffset = new Date().getTimezoneOffset() / -60;

    return (
        <div className='d-flex align-items-center'
            style={{
                height: '40px',
            }}
        >
            <Text className='font-weight-semibold'>
                {`[GMT${gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset}] ${currentTime.toLocaleTimeString('ru-RU', {
                    timeZone: browserTimeZone,
                })}`}
            </Text>
        </div>
    );
};
