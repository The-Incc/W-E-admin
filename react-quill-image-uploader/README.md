# React Quill Image Uploader

A reliable solution for adding image upload functionality to ReactQuill editors.

## Features

- 🖼️ Adds a custom image upload button to ReactQuill
- 🔄 Handles server-side image uploads
- 🛡️ Reliable image insertion at cursor position
- ⚙️ Framework-agnostic with zero dependencies
- 🔧 Highly customizable (button position, styling, etc.)
- 🧩 Works with any UI framework (or none at all)

## Installation

```bash
npm install react-quill-image-uploader
# or
yarn add react-quill-image-uploader
```

## Basic Usage

```jsx
import React, { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { QuillImageUploader, applyQuillStyles } from 'react-quill-image-uploader';

const MyEditor = () => {
  const [value, setValue] = useState('');
  const quillRef = useRef(null);
  
  // Apply custom styles for images
  useEffect(() => {
    const cleanup = applyQuillStyles();
    return cleanup;
  }, []);
  
  // Function to upload image to your server
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('https://your-api.com/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data; // Should return { url: '...' } or { image: { url: '...' } }
  };
  
  return (
    <div style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '4px' }}>
      {/* Image Uploader Component */}
      <QuillImageUploader 
        quillRef={quillRef}
        uploadFunction={uploadImage}
        buttonPosition="top-right" // or "top-left"
      />
      
      {/* ReactQuill Editor */}
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={setValue}
        modules={{
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['link'], // Note: We've removed 'image' from here
              ['clean']
            ]
          }
        }}
      />
    </div>
  );
};

export default MyEditor;
```

## API Reference

### `QuillImageUploader` Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `quillRef` | `RefObject<ReactQuill>` | Yes | - | React ref to the ReactQuill component |
| `uploadFunction` | `(file: File) => Promise<{ url: string } \| { image: { url: string } }>` | Yes | - | Async function to upload image and return URL |
| `buttonPosition` | `'top-right'` \| `'top-left'` | No | `'top-right'` | Position of the upload button |
| `toastFunction` | `(type: string, message: string) => void` | No | `console.log` | Function to show notifications |
| `buttonStyles` | `Object` | No | `{}` | Additional styles for the button container |
| `customIcon` | `ReactNode` | No | - | Custom icon component |

### `applyQuillStyles`

A utility function that applies CSS styles to enhance the appearance of uploaded images in the editor.

```jsx
useEffect(() => {
  const cleanup = applyQuillStyles();
  return cleanup; // Clean up on unmount
}, []);
```

## With Toast Notifications

This example shows how to use the component with toast notifications:

```jsx
import React, { useRef, useState } from 'react';
import { QuillImageUploader } from 'react-quill-image-uploader';
import toast from 'react-hot-toast'; // or any toast library

function Editor() {
  // ...
  
  const handleToast = (type, message) => {
    switch (type) {
      case 'loading': return toast.loading(message, { id: 'image-upload' });
      case 'success': return toast.success(message, { id: 'image-upload' });
      case 'error': return toast.error(message, { id: 'image-upload' });
      default: return console.log(message);
    }
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <QuillImageUploader 
        quillRef={quillRef}
        uploadFunction={uploadImage}
        toastFunction={handleToast}
      />
      <ReactQuill ref={quillRef} /* ... */ />
    </div>
  );
}
```

## With Custom Icon

```jsx
import React from 'react';
import { QuillImageUploader } from 'react-quill-image-uploader';
import { ImageIcon } from 'your-icon-library';

function Editor() {
  // ...
  
  return (
    <div style={{ position: 'relative' }}>
      <QuillImageUploader 
        quillRef={quillRef}
        uploadFunction={uploadImage}
        customIcon={<ImageIcon size={18} />}
      />
      <ReactQuill ref={quillRef} /* ... */ />
    </div>
  );
}
```

## Troubleshooting

### Button not visible?

Make sure the parent container has `position: relative` and the QuillImageUploader component is placed before the ReactQuill component.

### Images not uploading?

Check that your `uploadFunction` is properly implemented and returns an object with either a `url` property or an `image.url` property.

### Handler not attaching to toolbar?

This package uses multiple initialization attempts with timeouts to ensure reliable operation. If you're still having issues, make sure your quillRef is properly passed to the component.

## License

MIT 