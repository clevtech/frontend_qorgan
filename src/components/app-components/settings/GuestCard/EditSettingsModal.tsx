import { Modal, Input, Form, Typography, Spin } from 'antd';
import { useEffect, useState } from 'react';

const EditSettingsModal = ({ isOpen, onClose, onSave, initialIp }) => {
	const [newIp, setNewIp] = useState(initialIp);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
		if (isOpen) {
			setNewIp(initialIp);
		}
	}, [initialIp, isOpen]);

    const handleSave = async () => {
        setIsLoading(true)
		try {
			await onSave(newIp); 
			onClose(); 
		} catch (error) {
			setNewIp(initialIp); 
		} finally {
            setIsLoading(false)
        }
	};
	return (
		<Modal
			title="Редактирование IP-адреса"
			open={isOpen}
			onOk={handleSave}
			onCancel={onClose}
            bodyStyle={{padding:'20px'}}
		>
            <Typography>Ниже введите данные для добавления объекта</Typography>
            {isLoading
                ?
                <div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%", // Растягиваем на всю высоту
						backgroundColor: "rgba(255, 255, 255, 0.8)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 10,
					}}
				>
					<Spin size="large" />
				</div>
                :
                <Form.Item
                    className='mb-0'
                    label='IP адрес'
                    required
                    rules={[
                        {
                            required: true,
                            message: 'Заполните  IP адрес',
                        },
                    ]}
                >
                    <Input
                        name='ip_addr'
                        onChange={(e) => setNewIp(e.target.value)}
                        value={newIp}
                        placeholder="Введите новый IP"
                    />
                </Form.Item>
            }
            
		</Modal>
	);
};

export default EditSettingsModal;