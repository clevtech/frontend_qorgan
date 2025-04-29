import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import {
    IconCalendarDue,
    IconCar,
    IconDoorOff,
    IconFaceId,
    IconFall,
    IconHomeQuestion,
    IconUsers,
    IconVideoOff,
} from '@tabler/icons-react';

import { components } from '@/types/generated';
import { MehOutlined } from '@ant-design/icons';

export type AttendanceRead = components['schemas']['AttendanceRead'];
export type AttendancesEmployeeRead = components['schemas']['AttendancesEmployeeRead'];
export type AttendancesRead = components['schemas']['AttendancesRead'];
export type CameraCreate = components['schemas']['CameraCreate'];
export type CameraModuleCreate = components['schemas']['CameraModuleInput'];
export type CameraRead = components['schemas']['CameraRead'];
export type CameraUpdate = components['schemas']['CameraUpdate'];
export type CamerasRead = components['schemas']['CamerasRead'];
export type DailyOrderCreate = components['schemas']['DailyOrderCreate'];
export type DailyOrderRead = components['schemas']['DailyOrderRead'];
export type DailyOrdersRead = components['schemas']['DailyOrdersRead'];
export type EmployeeCreate = components['schemas']['EmployeeCreate'];
export type EmployeeRead = components['schemas']['EmployeeRead'];
export type EmployeeUpdate = components['schemas']['EmployeeUpdate'];
export type EmployeesRead = components['schemas']['EmployeesRead'];
export type FaceCheckpointRead = components['schemas']['FaceCheckpointRead'];
export type FaceCheckpointUpdate = components['schemas']['FaceCheckpointUpdate'];
export type IncidentRead = components['schemas']['IncidentRead'];
export type IncidentsRead = components['schemas']['IncidentsRead'];
export type StreamCheckCreate = components['schemas']['StreamCheckCreate'];
export type StreamCheckRead = components['schemas']['StreamCheckRead'];
export type SummaryDetailRead = components['schemas']['SummaryDetailRead'];
export type SummaryRead = components['schemas']['SummaryRead'];
export type SummariesDetailRead = components['schemas']['SummariesDetailRead'];
export type SummariesRead = components['schemas']['SummariesRead'];
export type StatisticsRead = components['schemas']['TotalStatistics'];
export type TransportCreate = components['schemas']['TransportCreate'];
export type TransportRead = components['schemas']['TransportRead'];
export type TransportUpdate = components['schemas']['TransportUpdate'];
export type TransportsRead = components['schemas']['TransportsRead'];
export type TransportTrackingRead = components['schemas']['TransportTrackingRead'];
export type TransportTrackingsRead = components['schemas']['TransportTrackingsRead'];
export type WaybillCreate = components['schemas']['WaybillCreate'];
export type WaybillRead = components['schemas']['WaybillRead'];
export type WaybillUpdate = components['schemas']['WaybillUpdate'];
export type WaybillsRead = components['schemas']['WaybillsRead'];
export type WhiteListRead = components['schemas']['WhiteListRead'];
export type WhiteListsRead = components['schemas']['WhiteListsRead'];
export type WhiteListCreate = components['schemas']['WhiteListCreate'];

export const cameraModules = [
    {
        label: 'Face ID',
        value: 'FACE_DETECTION',
        requiresBoundingBox: true,
        icon: IconFaceId,
    },
    {
        label: 'Толпа',
        value: 'CHECK_CROWD',
        requiresBoundingBox: false,
        icon: IconUsers,
    },
    {
        label: 'Блокирование камеры',
        value: 'CHECK_BLOCKED',
        requiresBoundingBox: false,
        icon: IconVideoOff,
    },
    {
        label: 'Продолжительное нахождение военнослужащего в помещении',
        value: 'CHECK_TOILET',
        requiresBoundingBox: true,
        icon: IconHomeQuestion,
    },
    {
        label: 'Пост дневального',
        value: 'CHECK_ABSENCE',
        requiresBoundingBox: true,
        icon: IconCalendarDue,
    },
    {
        label: 'Несанкционированный вход (КХО)',
        value: 'CHECK_KHO',
        requiresBoundingBox: true,
        icon: IconDoorOff,
    },
    {
        label: 'Драка',
        value: 'CHECK_FIGHT',
        requiresBoundingBox: false,
        icon: MehOutlined,
    },
    {
        label: 'Падение',
        value: 'CHECK_LYING',
        requiresBoundingBox: false,
        icon: IconFall,
    },
    {
        label: 'Номера',
        value: 'CHECK_PLATE',
        requiresBoundingBox: false,
        icon: IconCar,
    },

    // {
    //     label: 'Бег',
    //     value: 'CHECK_RUN',
    //     requiresBoundingBox: false,
    // },
];

export const cameraModulesMap: Record<components['schemas']['CameraType'], string> = {
    FACE_DETECTION: 'Face ID',
    CHECK_CROWD: 'Толпа',
    CHECK_BLOCKED: 'Блокирование камеры',
    CHECK_TOILET: 'Продолжительное нахождение военнослужащего в помещении',
    CHECK_ABSENCE: 'Пост дневального',
    CHECK_KHO: 'Несанкционированный вход (КХО)',
    CHECK_LYING: 'Падение',
    CHECK_PLATE: 'Номера',
    CHECK_RUN: 'Бег',
};

export const incidentNameToDescriptionMap: Record<string, string> = {
    'Блокирование камеры': 'Обзор был заблокирован или сдвинута камера',
    'Несанкционированный вход': 'Проникновение неизвестного лица',
    'Камера': 'Соединение с камерой разорвано',
    'Пост дневального': 'Сотрудник не находится на посту больше 5-ти минут',
    'Несанкционированный вход (КХО)': 'Вход в помещение',
    'Толпа': 'Рядом стоящие люди в количестве больше 5-ти',
    'Продолжительное нахождение военнослужащего в помещении': 'Продолжительное нахождение военнослужащего в помещении',
    'Драка': 'Драка',
};

export const personStatusToColorMap: Record<string, string> = {
    'ПРИБЫЛ': '#52C41A',
    'ВРЕМЕННО ОТСУТСТВУЕТ': '#F5222D',
    'НЕЗАКОННО ОТСУТСТВУЕТ': '#F5222D',
    'НА БОЛЬНИЧНОМ': '#722ED1',
    'ПО РАПОРТУ': '#366EF6',
    'В ОТПУСКЕ': '#13C2C2',
    'ОПОЗДАНИЕ': '#FAAD14',
    'ОПОЗДАЛ': '#FAAD14',
};

export enum HttpMethods {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch',
}

export type AntdIcon = React.ForwardRefExoticComponent<
    Pick<
        AntdIconProps,
        | 'start'
        | 'hidden'
        | 'color'
        | 'content'
        | 'size'
        | 'style'
        | 'default'
        | 'wrap'
        | 'open'
        | 'height'
        | 'rotate'
        | 'translate'
        | 'width'
        | 'multiple'
        | 'disabled'
        | 'cite'
        | 'data'
        | 'form'
        | 'label'
        | 'slot'
        | 'span'
        | 'summary'
        | 'title'
        | 'pattern'
        | 'children'
        | 'key'
        | 'accept'
        | 'acceptCharset'
        | 'action'
        | 'allowFullScreen'
        | 'allowTransparency'
        | 'alt'
        | 'as'
        | 'async'
        | 'autoComplete'
        | 'autoPlay'
        | 'capture'
        | 'cellPadding'
        | 'cellSpacing'
        | 'charSet'
        | 'challenge'
        | 'checked'
        | 'classID'
        | 'cols'
        | 'colSpan'
        | 'controls'
        | 'coords'
        | 'crossOrigin'
        | 'dateTime'
        | 'defer'
        | 'download'
        | 'encType'
        | 'formAction'
        | 'formEncType'
        | 'formMethod'
        | 'formNoValidate'
        | 'formTarget'
        | 'frameBorder'
        | 'headers'
        | 'high'
        | 'href'
        | 'hrefLang'
        | 'htmlFor'
        | 'httpEquiv'
        | 'integrity'
        | 'keyParams'
        | 'keyType'
        | 'kind'
        | 'list'
        | 'loop'
        | 'low'
        | 'manifest'
        | 'marginHeight'
        | 'marginWidth'
        | 'max'
        | 'maxLength'
        | 'media'
        | 'mediaGroup'
        | 'method'
        | 'min'
        | 'minLength'
        | 'muted'
        | 'name'
        | 'noValidate'
        | 'optimum'
        | 'defaultChecked'
        | 'defaultValue'
        | 'suppressContentEditableWarning'
        | 'suppressHydrationWarning'
        | 'accessKey'
        | 'autoFocus'
        | 'className'
        | 'contentEditable'
        | 'contextMenu'
        | 'dir'
        | 'draggable'
        | 'id'
        | 'lang'
        | 'nonce'
        | 'placeholder'
        | 'spellCheck'
        | 'tabIndex'
        | 'radioGroup'
        | 'role'
        | 'about'
        | 'datatype'
        | 'inlist'
        | 'prefix'
        | 'property'
        | 'rel'
        | 'resource'
        | 'rev'
        | 'typeof'
        | 'vocab'
        | 'autoCapitalize'
        | 'autoCorrect'
        | 'autoSave'
        | 'itemProp'
        | 'itemScope'
        | 'itemType'
        | 'itemID'
        | 'itemRef'
        | 'results'
        | 'security'
        | 'unselectable'
        | 'inputMode'
        | 'is'
        | 'aria-activedescendant'
        | 'aria-atomic'
        | 'aria-autocomplete'
        | 'aria-busy'
        | 'aria-checked'
        | 'aria-colcount'
        | 'aria-colindex'
        | 'aria-colspan'
        | 'aria-controls'
        | 'aria-current'
        | 'aria-describedby'
        | 'aria-details'
        | 'aria-disabled'
        | 'aria-dropeffect'
        | 'aria-errormessage'
        | 'aria-expanded'
        | 'aria-flowto'
        | 'aria-grabbed'
        | 'aria-haspopup'
        | 'aria-hidden'
        | 'aria-invalid'
        | 'aria-keyshortcuts'
        | 'aria-label'
        | 'aria-labelledby'
        | 'aria-level'
        | 'aria-live'
        | 'aria-modal'
        | 'aria-multiline'
        | 'aria-multiselectable'
        | 'aria-orientation'
        | 'aria-owns'
        | 'aria-placeholder'
        | 'aria-posinset'
        | 'aria-pressed'
        | 'aria-readonly'
        | 'aria-relevant'
        | 'aria-required'
        | 'aria-roledescription'
        | 'aria-rowcount'
        | 'aria-rowindex'
        | 'aria-rowspan'
        | 'aria-selected'
        | 'aria-setsize'
        | 'aria-sort'
        | 'aria-valuemax'
        | 'aria-valuemin'
        | 'aria-valuenow'
        | 'aria-valuetext'
        | 'target'
        | 'type'
        | 'playsInline'
        | 'poster'
        | 'preload'
        | 'readOnly'
        | 'required'
        | 'reversed'
        | 'rows'
        | 'rowSpan'
        | 'sandbox'
        | 'scope'
        | 'scoped'
        | 'scrolling'
        | 'seamless'
        | 'selected'
        | 'shape'
        | 'sizes'
        | 'src'
        | 'srcDoc'
        | 'srcLang'
        | 'srcSet'
        | 'step'
        | 'useMap'
        | 'value'
        | 'wmode'
        | 'dangerouslySetInnerHTML'
        | 'onCopy'
        | 'onCopyCapture'
        | 'onCut'
        | 'onCutCapture'
        | 'onPaste'
        | 'onPasteCapture'
        | 'onCompositionEnd'
        | 'onCompositionEndCapture'
        | 'onCompositionStart'
        | 'onCompositionStartCapture'
        | 'onCompositionUpdate'
        | 'onCompositionUpdateCapture'
        | 'onFocus'
        | 'onFocusCapture'
        | 'onBlur'
        | 'onBlurCapture'
        | 'onChange'
        | 'onChangeCapture'
        | 'onBeforeInput'
        | 'onBeforeInputCapture'
        | 'onInput'
        | 'onInputCapture'
        | 'onReset'
        | 'onResetCapture'
        | 'onSubmit'
        | 'onSubmitCapture'
        | 'onInvalid'
        | 'onInvalidCapture'
        | 'onLoad'
        | 'onLoadCapture'
        | 'onError'
        | 'onErrorCapture'
        | 'onKeyDown'
        | 'onKeyDownCapture'
        | 'onKeyPress'
        | 'onKeyPressCapture'
        | 'onKeyUp'
        | 'onKeyUpCapture'
        | 'onAbort'
        | 'onAbortCapture'
        | 'onCanPlay'
        | 'onCanPlayCapture'
        | 'onCanPlayThrough'
        | 'onCanPlayThroughCapture'
        | 'onDurationChange'
        | 'onDurationChangeCapture'
        | 'onEmptied'
        | 'onEmptiedCapture'
        | 'onEncrypted'
        | 'onEncryptedCapture'
        | 'onEnded'
        | 'onEndedCapture'
        | 'onLoadedData'
        | 'onLoadedDataCapture'
        | 'onLoadedMetadata'
        | 'onLoadedMetadataCapture'
        | 'onLoadStart'
        | 'onLoadStartCapture'
        | 'onPause'
        | 'onPauseCapture'
        | 'onPlay'
        | 'onPlayCapture'
        | 'onPlaying'
        | 'onPlayingCapture'
        | 'onProgress'
        | 'onProgressCapture'
        | 'onRateChange'
        | 'onRateChangeCapture'
        | 'onSeeked'
        | 'onSeekedCapture'
        | 'onSeeking'
        | 'onSeekingCapture'
        | 'onStalled'
        | 'onStalledCapture'
        | 'onSuspend'
        | 'onSuspendCapture'
        | 'onTimeUpdate'
        | 'onTimeUpdateCapture'
        | 'onVolumeChange'
        | 'onVolumeChangeCapture'
        | 'onWaiting'
        | 'onWaitingCapture'
        | 'onAuxClick'
        | 'onAuxClickCapture'
        | 'onClick'
        | 'onClickCapture'
        | 'onContextMenu'
        | 'onContextMenuCapture'
        | 'onDoubleClick'
        | 'onDoubleClickCapture'
        | 'onDrag'
        | 'onDragCapture'
        | 'onDragEnd'
        | 'onDragEndCapture'
        | 'onDragEnter'
        | 'onDragEnterCapture'
        | 'onDragExit'
        | 'onDragExitCapture'
        | 'onDragLeave'
        | 'onDragLeaveCapture'
        | 'onDragOver'
        | 'onDragOverCapture'
        | 'onDragStart'
        | 'onDragStartCapture'
        | 'onDrop'
        | 'onDropCapture'
        | 'onMouseDown'
        | 'onMouseDownCapture'
        | 'onMouseEnter'
        | 'onMouseLeave'
        | 'onMouseMove'
        | 'onMouseMoveCapture'
        | 'onMouseOut'
        | 'onMouseOutCapture'
        | 'onMouseOver'
        | 'onMouseOverCapture'
        | 'onMouseUp'
        | 'onMouseUpCapture'
        | 'onSelect'
        | 'onSelectCapture'
        | 'onTouchCancel'
        | 'onTouchCancelCapture'
        | 'onTouchEnd'
        | 'onTouchEndCapture'
        | 'onTouchMove'
        | 'onTouchMoveCapture'
        | 'onTouchStart'
        | 'onTouchStartCapture'
        | 'onPointerDown'
        | 'onPointerDownCapture'
        | 'onPointerMove'
        | 'onPointerMoveCapture'
        | 'onPointerUp'
        | 'onPointerUpCapture'
        | 'onPointerCancel'
        | 'onPointerCancelCapture'
        | 'onPointerEnter'
        | 'onPointerEnterCapture'
        | 'onPointerLeave'
        | 'onPointerLeaveCapture'
        | 'onPointerOver'
        | 'onPointerOverCapture'
        | 'onPointerOut'
        | 'onPointerOutCapture'
        | 'onGotPointerCapture'
        | 'onGotPointerCaptureCapture'
        | 'onLostPointerCapture'
        | 'onLostPointerCaptureCapture'
        | 'onScroll'
        | 'onScrollCapture'
        | 'onWheel'
        | 'onWheelCapture'
        | 'onAnimationStart'
        | 'onAnimationStartCapture'
        | 'onAnimationEnd'
        | 'onAnimationEndCapture'
        | 'onAnimationIteration'
        | 'onAnimationIterationCapture'
        | 'onTransitionEnd'
        | 'onTransitionEndCapture'
        | 'spin'
        | 'twoToneColor'
    > &
        React.RefAttributes<HTMLSpanElement>
>;

export type ModalMode = 'create' | 'update';

export type NavItem = {
    breadcrumb: boolean;
    icon?: AntdIcon;
    isGroupTitle?: boolean;
    key: string;
    path: string | null;
    submenu?: Array<NavItem>;
    title: string;
    role: string[]
};

export type Props = {
    isOpen: boolean;
    onClose: () => void;
    isEdit?: string;
    record?: Record<string, unknown>;
};
