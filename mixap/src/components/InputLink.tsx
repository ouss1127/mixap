import React, { useState } from 'react';
import { Popover, Button, Input } from 'antd'; // Ant Design components for popover, button, and input
import { LinkOutlined, CheckOutlined } from '@ant-design/icons'; // Ant Design icons for link and check

/** @jsxImportSource @emotion/react */ // Enables the use of the css prop for styling

// InputUrl component definition
export function InputLink({ value, size, onChange, style, icon }: any) {
  // State to manage the current value of the input and the visibility of the popover
  const [currentValue, setCurrentValue] = useState(value);
  const [visible, setVisible] = useState(false);

  // Handle input change by updating the current value
  const handleChange = (e) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
  };

  // Handle visibility change of the popover
  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  // Handle the OK button click to trigger the onChange callback and hide the popover
  const handleOkClick = () => {
    onChange(currentValue); // Trigger the change when OK is clicked
    setVisible(false); // Hide the popover after clicking OK
  };

  // The input element rendered inside the popover
  const urlInput = (
    <div css={{ padding: 8, display: 'flex', alignItems: 'center' }}>
      <Input
        value={currentValue}
        onChange={handleChange}
        placeholder='Enter URL' // Placeholder text for the input
        addonBefore='http://' // Text displayed before the input field
        style={{ width: 240, marginRight: 8 }} // Set the width of the input
      />
      <Button
        type='primary'
        icon={<CheckOutlined />} // Display a check icon on the OK button
        onClick={handleOkClick} // Handle OK button click
      />
    </div>
  );

  // Return the main JSX for the InputUrl component
  return (
    <Popover
      content={urlInput} // The content of the popover, which includes the input field and OK button
      trigger='click' // Show the popover when the button is clicked
      visible={visible} // Control the visibility of the popover
      onVisibleChange={handleVisibleChange}>
      {' '}
      {/* Update visibility state */}
      <Button
        size={size} // Set the size of the button
        style={style} // Apply custom styles to the button
        type='text' // Use text button style
        icon={icon || <LinkOutlined />} // Use the provided icon or the default link icon
      />
    </Popover>
  );
}
