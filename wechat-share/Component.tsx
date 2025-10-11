import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import WechatShareModal from './components/WechatShareModal/index';
import { useWechatShare } from './hooks';

// 添加接口定义
interface ShareData {
  title: string;
  description: string;
  imageUrl: string;
}

const Component = ({ editor, previewElement }: any) => {
  const [show, setShowState] = useState(false);
  const { t } = useTranslation('plugin', {
    keyPrefix: 'wechat_share.frontend',
  });
  
  useWechatShare(previewElement);

  useEffect(() => {
    if (!editor) return;
    editor.addKeyMap({
      'Ctrl-w': handleShow,
    });
  }, [editor]);

  const handleShow = () => {
    setShowState(true);
  };

  const handleConfirm = ({ title, description, imageUrl }: ShareData) => {
    setShowState(false);
    const cursor = editor.getCursor();
    if (cursor.ch !== 0) {
      editor.replaceSelection('\n');
    }
    editor.replaceSelection(
      `[wechat-share title="${title}" description="${description}" image="${imageUrl}"]\n`
    );
  };

  return (
    <>
      <Button variant="outline-secondary" size="sm" onClick={handleShow}>
        <i className="bi bi-wechat" /> {t('btn_text')}
      </Button>
      <WechatShareModal
        show={show}
        onHide={() => setShowState(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};


export default Component;

