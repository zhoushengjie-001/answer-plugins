import Component from './Component';
import { useWechatShare } from './hooks';
import i18nConfig from './i18n';
import info from './info.yaml';

export default {
  info: {
    slug_name: info.slug_name,
    type: info.type,
  },
  component: Component,
  i18nConfig,
  hooks: {
    useRender: [useWechatShare],
  },
};