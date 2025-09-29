import { RootState } from '@/store'
import { onLocaleChange } from '@/store/slices/themeSlice'
import { Select } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

export const LangToggle = () => {
	const lang = useSelector((state: RootState) => state.theme.locale)
	const dispatch = useDispatch()

	const handleLangChange = (lang: string) => {
		dispatch(onLocaleChange(lang))
	}

	return (
		<div>
			<Select value={lang} onChange={handleLangChange}>
				<Select.Option value='en'>EN</Select.Option>
				<Select.Option value='ru'>RU</Select.Option>
				<Select.Option value='kk'>KK</Select.Option>
			</Select>
		</div>
	)
}
