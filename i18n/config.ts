import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

const LANGUAGE_KEY = 'user-language';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
};

let isInitialized = false;
let initPromise: Promise<void> | null = null;

const initI18n = async () => {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

      if (!savedLanguage) {
        const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'fr';
        savedLanguage = deviceLanguage;
      }

      // Setup RTL for Arabic
      const shouldBeRTL = savedLanguage === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }

      await i18n
        .use(initReactI18next)
        .init({
          resources,
          lng: savedLanguage,
          fallbackLng: 'fr',
          interpolation: {
            escapeValue: false,
          },
          react: {
            useSuspense: false,
          },
        });

      isInitialized = true;
    } catch (error) {
      console.error('i18n initialization error:', error);
      // Fallback to French if initialization fails
      await i18n
        .use(initReactI18next)
        .init({
          resources,
          lng: 'fr',
          fallbackLng: 'fr',
          interpolation: {
            escapeValue: false,
          },
          react: {
            useSuspense: false,
          },
        });
      isInitialized = true;
    }
  })();

  return initPromise;
};

// Start initialization immediately
initI18n();

export default i18n;
export { initI18n };

export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  i18n.changeLanguage(language);

  // Update RTL direction
  const shouldBeRTL = language === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
};
