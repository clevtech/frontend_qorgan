import { Button, Collapse, Form, Input, InputNumber, Modal, Select, Typography } from 'antd';
import { useState } from 'react';

import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

import { components } from '@/types/generated';
import Canvas from '@/components/util-components/canvas/Canvas';
import { CamerasService } from '@/services/CamerasService';

const { useForm } = Form;
const { Panel } = Collapse;
const { Option } = Select;
const { Text } = Typography;

type CameraSettingsModalProps = {
    camera: components['schemas']['CameraOut'] | undefined;
    isCameraSettingsModalOpen: boolean;
    onCameraSettingsModalClose: () => void;
};

const cameraTypeModels = [
    {
        label: 'Драка',
        value: 'CHECK_FIGHT',
        requiresBoundingBox: false,
    },
    {
        label: 'Распознавание лица',
        value: 'FACE_DETECTION',
        requiresBoundingBox: true,
    },
    {
        label: 'Толпа',
        value: 'CHECK_CROWD',
        requiresBoundingBox: false,
    },
    {
        label: 'Блокирование камеры',
        value: 'CHECK_BLOCKED',
        requiresBoundingBox: false,
    },
    {
        label: 'Продолжительное нахождение военнослужащего в помещении',
        value: 'CHECK_TOILET',
        requiresBoundingBox: true,
    },
    {
        label: 'Пост дневального',
        value: 'CHECK_ABSENCE',
        requiresBoundingBox: true,
    },
    {
        label: 'Несанкционированный вход (КХО)',
        value: 'CHECK_KHO',
        requiresBoundingBox: true,
    },
    {
        label: 'Падение',
        value: 'CHECK_LYING',
        requiresBoundingBox: false,
    },
    {
        label: 'Номера',
        value: 'CHECK_PLATE',
        requiresBoundingBox: false,
    },
    {
        label: 'Бег',
        value: 'CHECK_RUN',
        requiresBoundingBox: false,
    },
];

const cameraTypeModelsMapper: Record<components['schemas']['CameraType'], string> = {
    FACE_DETECTION: 'Распознавание лица',
    CHECK_CROWD: 'Толпа',
    CHECK_BLOCKED: 'Блокирование камеры',
    CHECK_TOILET: 'Продолжительное нахождение военнослужащего в помещении',
    CHECK_ABSENCE: 'Пост дневального',
    CHECK_KHO: 'Несанкционированный вход (КХО)',
    CHECK_LYING: 'Падение',
    CHECK_PLATE: 'Номера',
    CHECK_RUN: 'Бег',
    CHECK_FIGHT: 'Драка',
};

export const CreateCameraModal = ({
    isCameraSettingsModalOpen,
    onCameraSettingsModalClose,
}: CameraSettingsModalProps) => {
    const [form] = useForm();

    const [coordinates, setCoordinates] = useState<components['schemas']['CoordinatesBaseInput'][]>();
    const [step, setStep] = useState<number>(1);
    const [cameraConf, setCameraConf] = useState<{
        name: string;
        typeModels: components['schemas']['CameraTypeBaseInput'][];
        ipAddress: string;
        username: string;
        password: string;
    }>();

    const handleOnDelete = () => {};

    const handleOnFinish = () => {
        if (cameraConf) {
            CamerasService.createCamera({
                name: cameraConf.name,
                typeModels: [
                    {
                        typeModel: cameraConf.typeModels[0].typeModel,
                        countOfPeople: cameraConf.typeModels[0].countOfPeople,
                        coordinates: coordinates,
                    },
                ],
                ipAddress: cameraConf.ipAddress,
                username: cameraConf.username,
                password: cameraConf.password,
            }).then(() => {
                handleOnReset();
                onCameraSettingsModalClose();
            });
        }
    };

    const handleOnNext = () => {
        const typeModel = cameraTypeModels.find(
            (cameraTypeModel) => cameraTypeModel.value === cameraConf?.typeModels[0].typeModel,
        );

        if (typeModel && !typeModel.requiresBoundingBox) {
            setStep(step + 2);
        } else {
            setStep(step + 1);
        }
    };

    const handleOnPrevious = () => {
        const typeModel = cameraTypeModels.find(
            (cameraTypeModel) => cameraTypeModel.value === cameraConf?.typeModels[0].typeModel,
        );

        if (typeModel && !typeModel.requiresBoundingBox) {
            setStep(step - 2);
        } else {
            setStep(step - 1);
        }
    };

    const handleOnReset = () => {
        form.resetFields();
    };

    return (
        <Modal
            footer={
                <div className='d-flex justify-content-end'>
                    {
                        <Button
                            danger={step === 1}
                            onClick={step === 1 ? handleOnDelete : handleOnPrevious}
                            type='default'
                            disabled={localStorage.getItem('ROLE') !== 'superadmin'}
                        >
                            {step === 1 ? 'Удалить камеру' : 'Назад'}
                        </Button>
                    }
                    {step >= 1 && step <= 3 && (
                        <Button
                            disabled={
                                (step === 1 && !cameraConf?.typeModels[0]?.typeModel) ||
                                (step === 1 &&
                                    step === 1 &&
                                    cameraConf?.typeModels[0].typeModel === 'CHECK_CROWD' &&
                                    !cameraConf?.typeModels[0].countOfPeople)
                                    || localStorage.getItem('ROLE') !== 'superadmin'
                            }
                            onClick={step >= 1 && step < 3 ? handleOnNext : handleOnFinish}
                            type='primary'
                        >
                            {step >= 1 && step < 3 ? 'Продолжить' : 'Завершить настройку'}
                        </Button>
                    )}
                </div>
            }
            onCancel={onCameraSettingsModalClose}
            open={isCameraSettingsModalOpen}
            title={`Настройки камеры ${`${
                cameraConf?.typeModels[0]?.typeModel
                    ? `- ${cameraTypeModelsMapper[cameraConf.typeModels[0].typeModel]}`
                    : ''
            }`}`}
        >
            <Form
                initialValues={
                    {
                        typeModels: cameraConf?.typeModels[0]?.typeModel,
                    } as {
                        typeModels: components['schemas']['CameraType'];
                    }
                }
                form={form}
                layout='vertical'
                onFinish={handleOnFinish}
            >
                {step === 1 ? (
                    <div>
                        <Form.Item label='IP адрес камеры' name='ipAddress' required>
                            <Input />
                        </Form.Item>
                    </div>
                ) : step === 2 ? (
                    <div>
                        <Form.Item label='Выберите функционал из нижеперечисленных' name='typeModels' required>
                            <Select
                                onChange={(val) => {
                                    setCameraConf({
                                        typeModels: [
                                            {
                                                typeModel: val as components['schemas']['CameraType'],
                                                countOfPeople: cameraConf?.typeModels[0]?.countOfPeople,
                                            },
                                        ],
                                        name: camera.name,
                                    });
                                }}
                                placeholder='Выберите один модуль'
                                style={{ width: '100%' }}
                            >
                                {cameraTypeModels.map((cameraTypeModel, idx) => (
                                    <Option key={idx} value={cameraTypeModel.value}>
                                        {cameraTypeModel.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {cameraConf && cameraConf.typeModels[0]?.typeModel === 'CHECK_CROWD' && (
                            <Collapse>
                                <Panel
                                    key={cameraConf.typeModels[0].typeModel}
                                    header={
                                        <div className='d-flex justify-content-between'>
                                            {`Распознавание – ${
                                                cameraTypeModelsMapper[cameraConf.typeModels[0].typeModel]
                                            }`}
                                            {cameraConf.typeModels[0].typeModel === 'CHECK_CROWD' &&
                                            !cameraConf.typeModels[0].countOfPeople ? (
                                                <WarningOutlined style={{ color: '#F5222D', fontSize: '16px' }} />
                                            ) : (
                                                <CheckCircleOutlined style={{ color: '#52C41A', fontSize: '16px' }} />
                                            )}
                                        </div>
                                    }
                                >
                                    <Text>Допустимое количество рядом стоящих людей:</Text>
                                    <Form.Item className='mb-0'>
                                        <InputNumber
                                            className='mt-2'
                                            name='countOfPeople'
                                            value={cameraConf?.typeModels[0].countOfPeople}
                                            onChange={(val) => {
                                                setCameraConf({
                                                    typeModels: [
                                                        {
                                                            countOfPeople: val as number,
                                                            typeModel: 'CHECK_CROWD',
                                                        },
                                                    ],
                                                    name: camera.name,
                                                });
                                            }}
                                            placeholder='Введите количество'
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Panel>
                            </Collapse>
                        )}
                    </div>
                ) : step === 3 ? (
                    <div>
                        <Text>{`Выберите область для функции "Распознавание – ${
                            cameraConf?.typeModels[0].typeModel &&
                            cameraTypeModelsMapper[cameraConf.typeModels[0].typeModel]
                        }"`}</Text>
                        <br />
                        <br />
                        <Canvas
                            imageUrl={camera.previewPath ? camera.previewPath : ''}
                            setCoordinates={setCoordinates}
                        />
                    </div>
                ) : (
                    step === 4 && (
                        <div>
                            <Text>Укажите дополнительные атрибуты камеры</Text>
                            <Form.Item className='mb-0'>
                                <Input
                                    name='name'
                                    value={cameraConf?.name}
                                    onChange={(e) => {
                                        setCameraConf({
                                            typeModels: cameraConf.typeModels,
                                            name: e.target.value,
                                        });
                                    }}
                                    placeholder='Введите название камеры'
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>
                    )
                )}
            </Form>
        </Modal>
    );
};
