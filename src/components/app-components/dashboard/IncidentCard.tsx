import moment from 'moment';

import { Card, Image, Typography } from 'antd';

import { IncidentRead } from '@/types/custom';

import imageFallback from '@/assets/imageFallback-1-1.png';

type IncidentCardProps = {
    idx: number;
    incident: IncidentRead;
};

export const IncidentCard = (props: IncidentCardProps) => {
    return (
        <Card
            size='small'
            style={{
                margin: '0px',
                ...(!(props.idx === 0) && { marginTop: '8px' }),
            }}
        >
            <div className='d-flex'>
                <Image
                    fallback={imageFallback}
                    preview={true}
                    src={props.incident.incidentImgPath ?? ''}
                    style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                    }}
                />
                <div
                    className='d-flex flex-column ml-3'
                    style={{
                        width: 'calc(100% - 1rem)',
                    }}
                >
                    <Typography.Text>{props.incident.typeOfIncident}</Typography.Text>
                    <div>
                        <Typography.Text
                            style={{
                                marginBottom: '0',
                            }}
                        >
                            Камера: {props.incident.cameraName}
                        </Typography.Text>
                        <br />
                        <Typography.Text>
                            Дата и время: {moment(props.incident.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Typography.Text>
                    </div>
                </div>
            </div>
        </Card>
    );
};
