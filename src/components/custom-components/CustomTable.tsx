import { Table, Pagination } from 'antd';

import type { TableProps, PaginationProps } from 'antd';

type CustomTableProps<T extends object> = {
    setCurrent: (page: number) => void;
    setPageSize: (size: number) => void;
    components?: any
} & TableProps<T> &
    PaginationProps;

export const CustomTable = <T extends object>(props: CustomTableProps<T>) => {
    const { columns, current, dataSource, loading, pageSize, total } = props;
    const { setCurrent, setPageSize } = props;
    return (
        <>
            <Table
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                pagination={false}
                rowKey='id'
                scroll={{
                    x: true,
                }}
                size='small'
                style={{
                    whiteSpace: 'nowrap',
                }}
                components={props?.components}
                // tableLayout='fixed'
            />

            {total !== undefined && total > 10  && (
                <Pagination
                    className='mt-3'
                    current={current}
                    defaultPageSize={pageSize}
                    onChange={(page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                    }}
                    onShowSizeChange={(page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                    }}
                    pageSize={pageSize}
                    showSizeChanger={true}
                    style={{
                        textAlign: 'end',
                    }}
                    total={total}
                />
            )}
        </>
    );
};
