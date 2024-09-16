import React from 'react';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button, Space, Upload } from 'antd';

import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FormatAlignJustifyOutlinedIcon from '@mui/icons-material/FormatAlignJustifyOutlined';
import FormatAlignRightOutlinedIcon from '@mui/icons-material/FormatAlignRightOutlined';
import FormatAlignCenterOutlinedIcon from '@mui/icons-material/FormatAlignCenterOutlined';
import FormatAlignLeftOutlinedIcon from '@mui/icons-material/FormatAlignLeftOutlined';
import StrikethroughSOutlinedIcon from '@mui/icons-material/StrikethroughSOutlined';
import FormatColorTextOutlinedIcon from '@mui/icons-material/FormatColorTextOutlined';
import FormatItalicOutlinedIcon from '@mui/icons-material/FormatItalicOutlined';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';

import { useTranslation } from 'react-i18next';

/** @jsxImportSource @emotion/react */

// The MenuBar component renders a toolbar for formatting text in the editor
const MenuBar = ({ editor }: any) => {
  // If no editor instance is available, return null
  if (!editor) {
    return null;
  }

  // Function to handle adding images to the editor
  const addImage = async (file: File) => {
    const url = URL.createObjectURL(file); // Create a Blob URL for the uploaded image

    // Insert the image into the editor content
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }

    return false; // Prevent the default upload behavior
  };

  // Render the toolbar with buttons for formatting text (bold, italic, alignment, etc.)
  return (
    <Space css={{ width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Button
        type='text'
        icon={<TitleOutlinedIcon />} // Heading button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} // Toggle heading level 2
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} // Highlight active state
      />
      <Button
        type='text'
        icon={<TextFieldsOutlinedIcon />} // Paragraph button
        onClick={() => editor.chain().focus().setParagraph().run()} // Set text to paragraph
        className={editor.isActive('paragraph') ? 'is-active' : ''} // Highlight if active
      />
      <Button
        type='text'
        icon={<FormatBoldOutlinedIcon />} // Bold text button
        onClick={() => editor.chain().focus().toggleBold().run()} // Toggle bold formatting
        className={editor.isActive('bold') ? 'is-active' : ''} // Highlight if active
      />
      <Button
        type='text'
        icon={<FormatItalicOutlinedIcon />} // Italic text button
        onClick={() => editor.chain().focus().toggleItalic().run()} // Toggle italic formatting
        className={editor.isActive('italic') ? 'is-active' : ''} // Highlight if active
      />
      <Button
        type='text'
        icon={<StrikethroughSOutlinedIcon />} // Strikethrough button
        onClick={() => editor.chain().focus().toggleStrike().run()} // Toggle strikethrough formatting
        className={editor.isActive('strike') ? 'is-active' : ''} // Highlight if active
      />
      <Button
        type='text'
        icon={<FormatColorTextOutlinedIcon />} // Highlight text button
        onClick={() => editor.chain().focus().toggleHighlight().run()} // Toggle text highlight
        className={editor.isActive('highlight') ? 'is-active' : ''} // Highlight if active
      />
      <Button
        type='text'
        icon={<FormatAlignLeftOutlinedIcon />} // Align left button
        onClick={() => editor.chain().focus().setTextAlign('left').run()} // Align text to the left
        className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''} // Highlight if active
      />
      <Button
        type='text'
        icon={<FormatAlignCenterOutlinedIcon />} // Align center button
        onClick={() => editor.chain().focus().setTextAlign('center').run()} // Align text to the center
        className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''} // Highlight if active
      />
      <Button
        type='text'
        icon={<FormatAlignRightOutlinedIcon />} // Align right button
        onClick={() => editor.chain().focus().setTextAlign('right').run()} // Align text to the right
        className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''} // Highlight if active
      />
      <Button
        type='text'
        icon={<FormatAlignJustifyOutlinedIcon />} // Justify text button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()} // Justify text
        className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''} // Highlight if active
      />
      {/* Image upload button */}
      <Upload
        accept={'image/png, image/jpeg, image/jpg, image/gif'} // Allow specific image formats
        multiple={false} // Disable multiple uploads
        showUploadList={false} // Hide default upload list
        beforeUpload={addImage} // Use the addImage function before uploading
        name='file'>
        <Button
          type='text'
          icon={<ImageOutlinedIcon />}
        />{' '}
        {/* Image upload icon */}
      </Upload>
    </Space>
  );
};

// The Editable component is the main editor with rich text features
export function Editable({ content, onChange }: any) {
  const { t } = useTranslation(); // i18n translation hook

  // Initialize the editor with desired extensions like Image, Highlight, Link, etc.
  const editor = useEditor({
    extensions: [
      StarterKit, // StarterKit provides basic functionality like bold, italic, etc.
      TextAlign.configure({
        types: ['heading', 'paragraph'], // Enable text alignment for headings and paragraphs
      }),
      Highlight, // Enable highlighting of text
      Image.configure({
        inline: true, // Configure inline images
      }),
      Link.configure({
        autolink: true, // Automatically detect links as they are typed
        openOnClick: true, // Links will be clickable
        linkOnPaste: true, // Convert pasted URLs into links
        HTMLAttributes: {
          rel: 'noopener noreferrer', // Security attribute for links
          target: '_blank', // Open links in a new tab
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      // Call onChange whenever the content is updated
      onChange && onChange?.(editor.getHTML());
    },
    content: content || t('common.edit-content'), // Initial content or translated default text
    editorProps: {
      // Handle the keydown event to detect when spacebar is pressed
      handleKeyDown(view, event) {
        // Detect spacebar (keyCode 32)
        if (event.keyCode === 32) {
          // Check if the current selection is part of a link
          const state = view.state;
          const { $from, to, empty } = state.selection;

          // If the selection is empty and inside a link, unset the link on spacebar press
          if (
            empty &&
            state.schema.marks.link.isInSet(state.storedMarks || $from.marks())
          ) {
            view.dispatch(
              state.tr.removeMark($from.pos, to, state.schema.marks.link),
            );
          }
        }
        return false; // Let the editor handle other key events
      },
    },
  });

  // Return the editor UI
  return (
    <Space
      direction='vertical'
      css={{
        padding: 12, // Padding around the editor
        border: '2px solid #000', // Solid border around the editor
        borderRadius: 5, // Rounded corners
        width: '90vw', // Set the editor width
        minHeight: '100%', // Set the minimum height to fill available space
        marginLeft: 'auto', // Center horizontally
        marginRight: 'auto', // Center horizontally
        '.ProseMirror': {
          // Custom styling for the editor content
          outline: 'none', // Remove focus outline
          img: {
            width: '50%', // Set image width to 50% of the container
          },
          a: {
            color: '#1890ff', // Set link color
            textDecoration: 'underline', // Underline links
          },
        },
      }}>
      <MenuBar editor={editor} /> {/* Render the toolbar */}
      <EditorContent editor={editor} /> {/* Render the content area */}
    </Space>
  );
}
