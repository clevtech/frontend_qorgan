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

export const CameraSettingsModal = ({
    camera,
    isCameraSettingsModalOpen,
    onCameraSettingsModalClose,
}: CameraSettingsModalProps) => {
    const [form] = useForm();

    const [step, setStep] = useState<number>(1);
    const [cameraConf, setCameraConf] = useState<components['schemas']['CameraUpdate']>({
        name: camera?.name || '',
        modules: camera?.modules || [],
    });

    const handleOnDelete = () => {};

    const handleOnFinish = () => {
        if (camera) {
            CamerasService.updateCameraById(
                {
                    path: {
                        id: camera.id,
                    },
                },
                {
                    body: {
                        ...cameraConf,
                    },
                },
            ).then(() => {
                handleOnReset();
                onCameraSettingsModalClose();
            });
        }
    };

    const handleOnNext = () => {
        const module = cameraModules.find(
            (cameraModule) => cameraModule.value === cameraConf.[0].typeModel,
        );

        if (module && !module.requiresBoundingBox) {
            setStep(step + 2);
        } else {
            setStep(step + 1);
        }
    };

    const handleOnPrevious = () => {
        const typeModel = cameraModules.find(
            (cameraTypeModel) => cameraTypeModel.value === cameraConf.typeModels[0].typeModel,
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

    if (!camera) return null;

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
                cameraConf?.[0]?.module ? `- ${cameraModulesMap[cameraConf.modules[0].module]}` : ''
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
                        <Form.Item
                            label='Выберите функционал из нижеперечисленных'
                            name='typeModels'
                            required
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Select
                                onChange={(val) => {
                                    setCameraConf({
                                        typeModels: [
                                            {
                                                typeModel: val as components['schemas']['CameraType'],
                                            },
                                        ],
                                        name: camera.name,
                                    });
                                }}
                                placeholder='Выберите один модуль'
                                style={{ width: '100%' }}
                            >
                                {cameraModules.map((cameraTypeModel, idx) => (
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
                                                cameraModulesMap[cameraConf.typeModels[0].typeModel]
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
                ) : step === 2 ? (
                    <div>
                        <Text>{`Выберите область для функции "Распознавание – ${
                            cameraConf?.typeModels[0].typeModel &&
                            cameraModulesMap[cameraConf.typeModels[0].typeModel]
                        }"`}</Text>
                        <br />
                        <br />
                        <Canvas
                            imageUrl={camera.previewPath ? camera.previewPath : ''}
                            setCoordinates={setCoordinates}
                        />
                    </div>
                ) : (
                    step === 3 && (
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
