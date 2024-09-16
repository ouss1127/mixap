import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '../enums/Language';
import { Select, Space } from 'antd';

const Lang = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<Language>(i18n.language as Language);

  const changeLanguage = (value: Language) => {
    switch (value) {
      case Language.EN:
      default:
        setLang(Language.EN);
        i18n.changeLanguage(Language.EN);
        localStorage.setItem('lang', Language.EN);
        break;
      case Language.FR:
        setLang(Language.FR);
        i18n.changeLanguage(Language.FR);
        localStorage.setItem('lang', Language.FR);
        break;
      case Language.DA:
        setLang(Language.DA);
        i18n.changeLanguage(Language.DA);
        localStorage.setItem('lang', Language.DA);
        break;
      case Language.EL:
        setLang(Language.EL);
        i18n.changeLanguage(Language.EL);
        localStorage.setItem('lang', Language.EL);
        break;
    }
  };

  return (
    <Space wrap>
      <Select
        value={lang}
        onChange={changeLanguage}
        options={[
          { value: Language.FR, label: 'FR' },
          { value: Language.EN, label: 'EN' },
          { value: Language.DA, label: 'DA' },
          { value: Language.EL, label: 'EL' },
        ]}
      />
    </Space>
  );
};

export default Lang;
