import { ComponentType, FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onBlankLayoutChange } from '@/store/slices/themeSlice';

interface Props {
    blankLayout?: boolean;
    component: ComponentType<unknown>;
}

const AppRoute: FC<Props> = ({ component: Component, blankLayout }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const isBlank = blankLayout ? true : false;

        dispatch(onBlankLayoutChange(isBlank));
    }, [blankLayout, dispatch]);

    return <Component />;
};

export default AppRoute;
