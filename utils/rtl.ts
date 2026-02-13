import { I18nManager } from 'react-native';
import i18n from '@/i18n/config';

export const isRTL = () => {
  return i18n.language === 'ar';
};

export const setupRTL = (language: string) => {
  const shouldBeRTL = language === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    // Note: Requires app restart to take effect
  }
};

export const getFlexDirection = () => {
  return isRTL() ? 'row-reverse' : 'row';
};

export const getTextAlign = (): 'left' | 'right' | 'center' => {
  return isRTL() ? 'right' : 'left';
};
