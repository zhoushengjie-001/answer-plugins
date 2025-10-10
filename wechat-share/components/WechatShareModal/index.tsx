import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface WechatShareModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (data: { title: string; description: string; imageUrl: string }) => void;
}

const WechatShareModal: React.FC<WechatShareModalProps> = ({ show, onHide, onConfirm }) => {
  const { t } = useTranslation('plugin', { keyPrefix: 'wechat_share.frontend' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.imageUrl) {
      onConfirm(formData);
      setFormData({ title: '', description: '', imageUrl: '' });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{t('modal_title') || '添加微信分享'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('title_label') || '分享标题'}</Form.Label>
            <Form.Control
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('title_placeholder') || '请输入分享标题'}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('description_label') || '分享描述'}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('description_placeholder') || '请输入分享描述'}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('image_label') || '分享图片URL'}</Form.Label>
            <Form.Control
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder={t('image_placeholder') || '请输入图片URL'}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            {t('cancel') || '取消'}
          </Button>
          <Button variant="primary" type="submit">
            {t('confirm') || '确认'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default WechatShareModal;