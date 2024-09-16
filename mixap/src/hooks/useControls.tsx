import React, { useEffect, useState } from 'react';
import { Form } from 'antd';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import ControlsForm from '../components/ControlsForm';
import useLogger from '../hooks/useLogger';

export default function useControls({
  options,
  fieldsValue,
  initialValues,
  onChange,
}: any) {
  const log = useLogger('useControls');
  const [form] = Form.useForm();
  const [controls, setControls] = useState({
    changedField: {},
    allFields: Object.assign(initialValues, fieldsValue),
  });

  useEffect(() => {
    form.setFieldsValue(fieldsValue);
  }, [form, fieldsValue]);

  const handleChange = (changedField, allFields) => {
    log.debug('changedField, allFields', changedField, allFields);
    // setControls({ changedField, allFields });
    onChange && onChange({ changedField, allFields });
  };

  return {
    controls,
    controlsForm: (
      <ControlsForm
        form={form}
        options={options}
        fieldsValue={fieldsValue}
        initialValues={initialValues}
        onChange={handleChange}
      />
    ),
  };
}
