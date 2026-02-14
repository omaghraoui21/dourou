import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import arTN from './locales/ar-TN.json';

const LANGUAGE_KEY = 'user-language';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
  'ar-TN': { translation: arTN },
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

      // Setup RTL for Arabic (includes ar-TN Tunisian Darija)
      const shouldBeRTL = savedLanguage === 'ar' || savedLanguage === 'ar-TN';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }

      await i18n
        .use(initReactI18next)
        .init({
          resources,
          lng: savedLanguage,
          fallbackLng: {
            'ar-TN': ['ar', 'fr', 'en'], // Tunisian Darija fallback chain
            'ar': ['fr', 'en'],
            'en': ['fr'],
            'default': ['fr', 'en']
          },
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

  // Update RTL direction (includes ar-TN Tunisian Darija)
  const shouldBeRTL = language === 'ar' || language === 'ar-TN';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
};
