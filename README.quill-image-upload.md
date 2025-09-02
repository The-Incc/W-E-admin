# ReactQuill Image Upload Implementation Guide

This guide explains how to implement a reliable image upload functionality for ReactQuill editors in your React application.

## Overview

ReactQuill doesn't natively support server-side image uploads. By default, it embeds images as base64 strings when users paste or select images, which can lead to performance issues with large images. This implementation provides a custom solution for uploading images to a server and embedding them as URLs.

## Implementation Approach

Our approach uses:
1. A custom image button in the top-right corner of the editor
2. A reliable image upload handler that works with the Quill API
3. Proper initialization timing to ensure the handler attaches correctly
4. Console logging for debugging purposes

## Step-by-Step Implementation

### 1. Add Required Dependencies

```bash
npm install react-quill react-hot-toast
# or
yarn add react-quill react-hot-toast
```

### 2. Create an API Function for Image Upload

Create a function to handle the image upload to your server:

```javascript
// Example API function (in your API file)
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload image');
  }
  
  return response.json(); // Should return { image: { url: '...' } } or { url: '...' }
};
```

### 3. Set Up the ReactQuill Component

```jsx
import { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { Box, Tooltip, IconButton, Typography } from '@mui/material'; // Or your UI library
import { uploadImage } from './your-api-file';

function Editor() {
  const [content, setContent] = useState('');
  const quillRef = useRef(null);
  
  // Custom image upload handler
  const handleImageUpload = (editor) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.click();
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          toast.loading('Uploading image...', { id: 'image-upload' });
          
          const response = await uploadImage(file);
          const imageUrl = response.image?.url || response.url;
          
          if (imageUrl) {
            const range = editor.getSelection(true);
            const index = range ? range.index : editor.getLength();
            
            editor.insertEmbed(index, 'image', imageUrl);
            editor.setSelection(index + 1);
            
            toast.success('Image uploaded successfully', { id: 'image-upload' });
          } else {
            throw new Error('No image URL received from server');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`, { id: 'image-upload' });
        }
      }
      
      document.body.removeChild(input);
    };
  };
  
  // Set up the image handler when the component is visible
  useEffect(() => {
    if (!quillRef.current) return;
    
    const setupImageHandler = () => {
      try {
        const editor = quillRef.current.getEditor();
        if (!editor) return;
        
        const toolbar = editor.getModule('toolbar');
        if (!toolbar) return;
        
        toolbar.addHandler('image', function() {
          handleImageUpload(editor);
        });
      } catch (error) {
        console.error('Error setting up image handler:', error);
      }
    };
    
    // Try multiple times with delays to ensure Quill is fully initialized
    setupImageHandler();
    const shortDelay = setTimeout(setupImageHandler, 300);
    const longDelay = setTimeout(setupImageHandler, 1000);
    
    return () => {
      clearTimeout(shortDelay);
      clearTimeout(longDelay);
    };
  }, []);
  
  return (
    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
      {/* Custom image upload button */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        zIndex: 100, 
        p: 0.5,
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        borderLeft: '1px solid #ddd',
        borderBottomLeftRadius: 4
      }}>
        <Tooltip title="Upload Image">
          <IconButton
            size="small"
            onClick={() => {
              if (quillRef.current) {
                handleImageUpload(quillRef.current.getEditor());
              }
            }}
          >
            <UploadIcon /> {/* Use your preferred icon */}
          </IconButton>
        </Tooltip>
      </Box>
      
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={setContent}
        modules={{
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              ['link'], // Note: We've removed 'image' from here since we're handling it separately
              ['clean']
            ]
          }
        }}
      />
    </Box>
  );
}

export default Editor;
```

### 4. Custom Styling for ReactQuill (Optional)

Add custom styles to make the ReactQuill editor look better:

```jsx
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `
    .ql-container {
      border: none !important;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      background: #fff;
      font-family: inherit;
    }
    .ql-toolbar {
      border: none !important;
      border-top: 1px solid #ddd !important;
      border-bottom: 1px solid #ddd !important;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      background: #f8f9fa;
      padding: 8px;
    }
    .ql-editor {
      min-height: 180px;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;
      padding: 12px;
    }
    .ql-editor img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 10px 0;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
}, []);
```

## Key Points for a Reliable Implementation

1. **Use a reference to the ReactQuill component**: 
   ```jsx
   const quillRef = useRef(null);
   ```

2. **Attach the handler after component mounts**:
   ```jsx
   useEffect(() => {
     // Setup code here
   }, []);
   ```

3. **Use multiple timing attempts** to ensure the handler is attached:
   ```jsx
   setupImageHandler();
   setTimeout(setupImageHandler, 300);
   setTimeout(setupImageHandler, 1000);
   ```

4. **Provide a custom image button** as a reliable alternative:
   ```jsx
   <IconButton onClick={() => handleImageUpload(quillRef.current.getEditor())}>
     <UploadIcon />
   </IconButton>
   ```

5. **Remove the default image button** from the toolbar to avoid confusion:
   ```jsx
   modules={{
     toolbar: {
       container: [
         // ... other buttons
         ['link'], // Not including 'image'
       ]
     }
   }}
   ```

## Debugging Tips

1. Add console logs to track the execution flow:
   ```javascript
   console.log('Setting up image handler');
   console.log('Image button clicked');
   console.log('File selected:', file.name);
   ```

2. Check for errors in the browser's console

3. Use toast notifications to inform users about the upload status

## Common Issues and Solutions

### Issue: Handler not attaching to the toolbar

**Solution**: Try multiple initialization attempts with different timeouts:
```javascript
setupImageHandler();
setTimeout(setupImageHandler, 300);
setTimeout(setupImageHandler, 1000);
```

### Issue: Image not inserted at cursor position

**Solution**: Ensure you're getting the proper selection range:
```javascript
const range = editor.getSelection(true); // true forces a check
const index = range ? range.index : editor.getLength();
```

### Issue: API call failing

**Solution**: Ensure proper error handling and debugging:
```javascript
try {
  const response = await uploadImage(file);
  console.log('API response:', response);
  // Handle success
} catch (error) {
  console.error('Upload error:', error);
  toast.error('Upload failed: ' + error.message);
}
```

## Conclusion

This implementation provides a reliable way to handle image uploads in ReactQuill by:
1. Using a custom positioned upload button
2. Properly attaching handlers to the Quill instance
3. Managing the file upload process with proper error handling
4. Inserting the returned URL into the editor at the cursor position

By following this guide, you can implement a robust image upload solution for your ReactQuill editors that works consistently across different scenarios. 