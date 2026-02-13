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

const initI18n = async () => {
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

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'fr',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;

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
