import i18next from 'i18next'
import en from './locales/cn.json'

export const i18nInit = async () =>
  i18next.init({
    lng: 'en',
    debug: false,
    resources: {
      en
    }
  })

const t = i18next.t
export default t
