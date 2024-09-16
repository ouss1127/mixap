import React, { useState } from 'react';
import { Button, Form, message, Upload } from 'antd';

import { useTranslation } from 'react-i18next';

/** @jsxImportSource @emotion/react */

export default function InputFile({
  style,
  icon,
  size,
  accept,
  key,
  capture = false,
}: any) {
  const [file, setFile] = useState<any>([]);

  const { t } = useTranslation();

  const normFile = (e: any) => {
    if (e?.file) {
      return e.file;
    }

    if (Array.isArray(e)) {
      return e;
    }

    return e?.fileList;
  };

  const handleBeforeUpload = async (file: any) => {
    if (accept.includes(file?.type)) {
      setFile(() => [file]);
    } else {
      message.warning(`${t('common.file-type-selection')} : ${accept}`);
    }

    return false;
  };

  return (
    <Form.Item
      name='file'
      valuePropName='file'
      getValueFromEvent={normFile}
      noStyle>
      <Upload
        accept={accept}
        multiple={false}
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        name='file'
        fileList={file}
        capture={capture}>
        <Button
          size={size}
          type='text'
          style={style}
          icon={icon}
        />
      </Upload>
    </Form.Item>
  );
}
