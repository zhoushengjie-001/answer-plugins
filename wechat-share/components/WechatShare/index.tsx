import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface WechatShareProps {
  title: string;
  description: string;
  imageUrl: string;
}

const isWechat = () => {
  return /micromessenger/i.test(navigator.userAgent);
};

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const WechatShareComponent: React.FC<WechatShareProps> = ({ title, description, imageUrl }: any) => {
  const { t } = useTranslation('plugin', { keyPrefix: 'wechat_share.frontend' });
  const [isWxEnv, setIsWxEnv] = useState(false);
  const [isMobileEnv, setIsMobileEnv] = useState(false);

  useEffect(() => {
    setIsWxEnv(isWechat());
    setIsMobileEnv(isMobile());

    if (isWechat()) {
      updateMetaTags();
    }
  }, [title, description, imageUrl]);

  const updateMetaTags = () => {
    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', imageUrl);
    updateMeta('og:url', window.location.href);
  };

  const handleShare = () => {
    if (isWxEnv) {
      alert(t('wechat_share_tip') || '请点击右上角菜单进行分享');
    } else if (isMobileEnv) {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert(t('link_copied') || '链接已复制到剪贴板');
        });
      }
    } else {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;
      const newWindow = window.open('', '_blank', 'width=300,height=300');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>微信扫码分享</title></head>
            <body style="text-align: center; padding: 20px;">
              <h3>扫码分享到微信</h3>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <p>使用微信扫描二维码分享此内容</p>
            </body>
          </html>
        `);
      }
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex align-items-center">
          <img 
            src={imageUrl} 
            alt={title} 
            style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+';
            }}
          />
          <div className="flex-grow-1">
            <h6 className="mb-1">{title}</h6>
            <p className="text-muted mb-2 small">{description}</p>
          </div>
          <Button 
            variant="success" 
            size="sm" 
            onClick={handleShare}
            className="d-flex align-items-center"
          >
            <i className="bi bi-wechat me-1" />
            {t('share_to_wechat') || '分享到微信'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};


export default WechatShareComponent;
