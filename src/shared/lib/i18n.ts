import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'

i18n
  .use(HttpApi) // Use HTTP backend to load translations
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    debug: true,
    fallbackLng: 'ru',
    supportedLngs: ['en', 'ru', 'kk'],
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    // Define namespaces
    ns: [
      'common',
      'auth',
      'dashboard',
      'vacancies',
      'candidates',
      'tests',
      'ai-analysis',
      'talent-market',
    ],
    defaultNS: 'common',
    backend: {
      // Path where translation files are located
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  })

export default i18n
