import { Modal, Radio, Table } from 'antd';

const { Group } = Radio;

export const TransportModalList = () => {
    const groupOptions = [
        {
            label: 'На территории',
            value: 'inTerritory',
        },
        {
            label: 'Вне территории',
            value: 'outsideTerritory',
        },
    ];

    return (
        <Modal title='Список транспорта'>
            <div className='d-flex justify-content-center'>
                <Group optionType='button' options={groupOptions} />
            </div>

            <Table />
        </Modal>
    );
};
