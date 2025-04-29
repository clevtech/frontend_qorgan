import moment from 'moment';

import { Button, Card, Image, Tag, Typography } from 'antd';
import { Dispatch, SetStateAction, useState } from 'react';

import { CommentOutlined, MoreOutlined, VideoCameraOutlined } from '@ant-design/icons';

import { UpdateCheckpointModal } from '@/components/app-components/checkpoint/UpdateCheckpointModal';
import { FaceCheckpointRead } from '@/types/custom';

import utils from '@/utils';

type PersonCardProps = {
    dateOfPass: string | undefined;
    faceCheckpoint: FaceCheckpointRead;
    filterValue: 'employee' | 'guest' | undefined;
    typeOfPass: 'Вход' | 'Выход';
    setCurrent: Dispatch<SetStateAction<number>>;
};

export const PersonCard = (props: PersonCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    return (
        <>
            {props.faceCheckpoint && (
                <UpdateCheckpointModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} {...props} />
            )}

            <Card
                className='d-flex flex-column'
                onClick={
                    props.faceCheckpoint && props.faceCheckpoint.personRole !== 'employee'
                        ? () => {
                              setIsModalOpen(true);
                          }
                        : undefined
                }
                onMouseEnter={
                    props.faceCheckpoint && props.faceCheckpoint.personRole !== 'employee'
                        ? (evt) => {
                              evt.currentTarget.style.cursor = 'pointer';
                              evt.currentTarget.style.transform = 'scale(1.025)';
                              evt.currentTarget.style.background = '#f2f2f2';
                              evt.currentTarget.style.transition = 'transform 0.5s';
                          }
                        : undefined
                }
                onMouseLeave={
                    props.faceCheckpoint && props.faceCheckpoint.personRole !== 'employee'
                        ? (evt) => {
                              evt.currentTarget.style.cursor = 'default';
                              evt.currentTarget.style.transform = 'scale(1)';
                              evt.currentTarget.style.background = '#fff';
                          }
                        : undefined
                }
                size='small'
                style={{
                    position: 'relative',
                }}
            >
                <div className='d-flex justify-content-between'>
                    <div
                        className='d-flex'
                        style={{
                            width: '100%',
                        }}
                    >
                        <Image
                            preview={false}
                            src={props.faceCheckpoint.imgPath ?? ''}
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                            }}
                        />
                        <div
                            className={'d-flex flex-column ml-2'}
                            style={{
                                width: 'calc(100% - 0.5rem - 80px)',
                            }}
                        >
                            <Tag
                                className='mt-1'
                                style={{
                                    padding: '0 10px',
                                    width: 'fit-content',
                                    color: `${props.faceCheckpoint.personRole === 'employee' ? '#52C41A' : '#F5222D'}`,
                                    border: `1px solid ${utils.lightenColor(
                                        props.faceCheckpoint.personRole === 'employee' ? '#52C41A' : '#F5222D',
                                        45,
                                    )}`,
                                    borderRadius: '14px',
                                    background: `${utils.lightenColor(
                                        props.faceCheckpoint.personRole === 'employee' ? '#52C41A' : '#F5222D',
                                        95,
                                    )}`,
                                    fontSize: '12px',
                                }}
                            >
                                {props.faceCheckpoint.personRole === 'employee'
                                    ? 'Сотрудник'
                                    : props.faceCheckpoint.personRole === 'guest'
                                    ? 'Гость'
                                    : 'Неизвестный человек'}
                            </Tag>

                            <Typography.Text
                                className='mt-1 ml-1'
                                style={{
                                    width: 'calc(100% - 1rem)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {props.faceCheckpoint.personFullName
                                    ? props.faceCheckpoint.personFullName
                                    : 'Нет данных'}
                            </Typography.Text>

                            {props.faceCheckpoint.comment && props.faceCheckpoint.personRole && (
                                <Typography.Text
                                    className='mb-0 ml-1 text-muted'
                                    style={{
                                        width: 'calc(100% - 1rem - 14px)',
                                        overflow: 'hidden',
                                        fontSize: '12px',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <CommentOutlined className='mr-2' />
                                    {props.faceCheckpoint.comment}
                                </Typography.Text>
                            )}
                        </div>
                    </div>

                    {props.faceCheckpoint.personRole !== 'employee' && (
                        <Button
                            className={'p-0 m-0'}
                            icon={<MoreOutlined />}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '5px',
                                width: 'auto',
                                height: 'auto',
                                color: '#72749A',
                            }}
                            type='link'
                        />
                    )}
                </div>

                <div className='d-flex justify-content-between mt-2' style={{ fontSize: '12px' }}>
                    <Typography.Text className='m-0 text-muted'>
                        <VideoCameraOutlined className='mr-2' />
                        {props.faceCheckpoint.cameraName}
                    </Typography.Text>

                    <Typography.Text className='m-0 text-muted'>
                        {moment(props.faceCheckpoint.dateOfPass).format('DD/MM/YYYY HH:mm')}
                    </Typography.Text>
                </div>
            </Card>
        </>
    );
};
