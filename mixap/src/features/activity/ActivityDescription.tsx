//import React from 'react';
import {Typography} from 'antd';
import { useTranslation } from 'react-i18next'; // Translation


/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

export default function ActivityDescription() {

    // Translation
    const { t } = useTranslation();

    return (
        <div className='mix-infos -activites'>

            <div className='mix-infos_title'>
                <Typography.Title level={4}>{t('common.activity')}</Typography.Title>
            </div>

            <div className='mix-infos_details'>
                <Typography.Text >{t('common.description-activity')}</Typography.Text>
            </div>

        </div>
    );
}