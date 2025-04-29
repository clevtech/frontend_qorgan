import { useEffect, useState } from 'react';

import { IncidentRead } from '@/types/custom';

export type WebSocketType = 'update_dashboard' | 'incident_created' | 'daily_order';

export type WebSocketMessage = {
    type: WebSocketType;
    data: IncidentRead;
};

const RECONNECT_ATTEMPTS = 999999999;
const RECONNECT_INTERVAL = 999999999;

export const useWebSocket = (url: string) => {
    const [jsonMessage, setJsonMessage] = useState<WebSocketMessage | null>(null);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);

        const handleError = () => {
            let attempts = RECONNECT_ATTEMPTS;

            if (attempts > 0) {
                attempts--;

                setTimeout(() => {
                    const socket = new WebSocket(url);

                    socket.addEventListener('open', handleOpen);
                    socket.addEventListener('message', handleMessage);
                    socket.addEventListener('error', handleError);

                    setWebSocket(socket);
                }, RECONNECT_INTERVAL);
            }
        };

        const handleMessage = (event: MessageEvent) => {
            try {
                const jsonMessage = JSON.parse(event.data) as WebSocketMessage;

                setJsonMessage(jsonMessage);
            } catch (error) {
                /* empty */
            }
        };

        const handleOpen = () => {
            console.log('connected to websocket stream');
        };

        socket.addEventListener('open', handleOpen);
        socket.addEventListener('message', handleMessage);
        socket.addEventListener('error', handleError);

        setWebSocket(socket);

        return () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [jsonMessage, url]);

    return { jsonMessage, webSocket };
};
