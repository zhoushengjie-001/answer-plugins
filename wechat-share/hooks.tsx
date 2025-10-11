import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import WechatShareComponent from './components/WechatShare/index';
import { Request } from './types';

interface Config {
  platform: string;
  enable: boolean;
}

const get = async (url: string) => {
  const response = await fetch(url);
  const { data } = await response.json();
  return data;
};

export const useWechatShare = (
  element: HTMLElement | null,
  request: Request = {
    get,
  },
) => {
  const [configs, setConfigs] = useState<Config[] | null>(null);

  const embeds = [
    {
      name: 'WechatShare',
      regexs: [/\[wechat-share\s+title="([^"]+)"\s+description="([^"]+)"\s+image="([^"]+)"\]/],
      embed: (match: string, title: string, description: string, imageUrl: string) => {
        return (
          <WechatShareComponent
            title={title}
            description={description}
            imageUrl={imageUrl}
          />
        );
      },
    },
  ];

  useEffect(() => {
    if (!element) return;

    const getConfigs = async () => {
      try {
        const data = await request.get('/answer/api/v1/plugin/config');
        const wechatEnabled = data?.wechat || false;
        if (wechatEnabled) {
          setConfigs([{ platform: 'wechat_share', enable: true }]);
        }
      } catch (error) {
        console.error('Failed to get embed config:', error);
      }
    };

    getConfigs();
  }, [element, request]);

  useEffect(() => {
    if (!element || !configs) return;

    const enabledEmbeds = embeds.filter((embed) =>
      configs.some((config) => config.platform === embed.name.toLowerCase().replace('share', '_share') && config.enable)
    );

    if (enabledEmbeds.length === 0) return;

    const processTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        let hasMatch = false;
        let newHTML = text;

        enabledEmbeds.forEach((embed) => {
          embed.regexs.forEach((regex) => {
            if (regex.test(text)) {
              hasMatch = true;
              newHTML = text.replace(regex, (match: string, title: string, description: string, imageUrl: string) => {
                const tempDiv = document.createElement('div');
                const root = createRoot(tempDiv);
                const component = embed.embed(match, title, description, imageUrl);
                root.render(component);
                return tempDiv.innerHTML;
              });
            }
          });
        });

        if (hasMatch && node.parentNode) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newHTML;
          while (tempDiv.firstChild) {
            node.parentNode.insertBefore(tempDiv.firstChild, node);
          }
          node.parentNode.removeChild(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const childNodes = Array.from(node.childNodes);
        childNodes.forEach(processTextNodes);
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            processTextNodes(node);
          }
        });
      });
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
    });

    processTextNodes(element);

    return () => {
      observer.disconnect();
    };
  }, [element, configs]);

};

