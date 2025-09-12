# React-Quill Image Upload Guide

This guide explains how to implement server-side image uploads in React-Quill without crashing the editor.

## Overview

By default, Quill embeds images as base64 strings. To upload images to a server and embed them as URLs instead, you need to customize the image handler.

## Quick Implementation (Crash-Free)

Here's a reliable implementation that won't crash your editor:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function QuillEditor() {
  const [value, setValue] = useState('');
  const quillRef = useRef(null);

  // Define the modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'], // Keep the 'image' button in toolbar
      ]
    }
  };

  // Set up the image handler after the component mounts
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const toolbar = editor.getModule('toolbar');
      
      // Replace the default image handler
      toolbar.addHandler('image', function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        
        input.onchange = async () => {
          const file = input.files[0];
          if (file) {
            // Create a FormData instance
            const formData = new FormData();
            formData.append('image', file);
            
            try {
              // Replace with your actual upload endpoint
              const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
                method: 'POST',
                body: formData,
              });
              
              const result = await response.json();
              
              // Get current cursor position
              const range = editor.getSelection(true);
              
              // Insert image at cursor position
              editor.insertEmbed(range.index, 'image', result.imageUrl);
              
              // Move cursor after the image
              editor.setSelection(range.index + 1);
            } catch (error) {
              console.error('Upload failed:', error);
              alert('Image upload failed');
            }
          }
        };
      });
    }
  }, []);
  
  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={setValue}
      modules={modules}
      theme="snow"
    />
  );
}

export default QuillEditor;
```

## Step-by-Step Implementation

### 1. Basic Setup

Start with a basic React-Quill component:

```jsx
import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function Editor() {
  const [content, setContent] = useState('');
  const quillRef = useRef(null);
  
  // Basic toolbar configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['link', 'image']
    ]
  };
  
  return (
    <ReactQuill
      ref={quillRef}
      value={content}
      onChange={setContent}
      modules={modules}
      theme="snow"
    />
  );
}

export default Editor;
```

### 2. Add Image Handler (Safe Method)

Use `useEffect` to add the handler after the component mounts:

```jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function Editor() {
  const [content, setContent] = useState('');
  const quillRef = useRef(null);
  
  // Basic toolbar configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['link', 'image']
    ]
  };
  
  // Register image handler after component mounts
  useEffect(() => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const toolbar = editor.getModule('toolbar');
    
    // Add the handler
    toolbar.addHandler('image', function() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();
      
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
          const response = await fetch('/api/upload', { // Your upload endpoint
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) throw new Error('Upload failed');
          
          const data = await response.json();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', data.imageUrl);
          editor.setSelection(range.index + 1);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Image upload failed');
        }
      };
    });
  }, []);
  
  return (
    <ReactQuill
      ref={quillRef}
      value={content}
      onChange={setContent}
      modules={modules}
      theme="snow"
    />
  );
}

export default Editor;
```

## Common Troubleshooting

If your implementation crashes, try these solutions:

### Issue 1: Toolbar not found

Make sure the toolbar is correctly initialized:

```jsx
useEffect(() => {
  if (!quillRef.current) return;
  
  // Safely access the editor and toolbar
  const editor = quillRef.current.getEditor();
  if (!editor) return;
  
  const toolbar = editor.getModule('toolbar');
  if (!toolbar) return;
  
  // Now safely add the handler
  toolbar.addHandler('image', imageHandler);
}, []);
```

### Issue 2: Race conditions

Use a slight delay to ensure Quill is fully initialized:

```jsx
useEffect(() => {
  setTimeout(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const toolbar = editor.getModule('toolbar');
      toolbar.addHandler('image', imageHandler);
    }
  }, 100);
}, []);
```

### Issue 3: Using direct modules config

If adding the handler in `useEffect` doesn't work, try this alternative approach:

```jsx
function Editor() {
  // Define image handler first
  const imageHandler = () => {
    // Image upload logic here
  };
  
  // Create modules object
  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic'],
        ['link', 'image']
      ],
      handlers: {
        // This approach can sometimes cause issues
        // Only use if the useEffect approach doesn't work
        image: imageHandler 
      }
    }
  }), []);
  
  // Rest of component...
}
```

## Server Implementation (Express)

Here's a simple Express server to handle the uploads:

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  }
});

// Handle image uploads
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Complete Example (Most Reliable Approach)

```jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function ImageUploadEditor() {
  const [content, setContent] = useState('');
  const [isReady, setIsReady] = useState(false);
  const quillRef = useRef(null);
  
  // Basic modules config without custom handler
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['link', 'image']
    ]
  };
  
  // Setup the editor after it's mounted
  useEffect(() => {
    if (!quillRef.current) return;
    
    // Small delay to ensure Quill is fully initialized
    const timeoutId = setTimeout(() => {
      const editor = quillRef.current.getEditor();
      if (!editor) return;
      
      const toolbar = editor.getModule('toolbar');
      if (!toolbar) return;
      
      // Add custom image handler
      toolbar.addHandler('image', function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        
        input.onchange = async () => {
          if (!input.files?.length) return;
          
          const file = input.files[0];
          const formData = new FormData();
          formData.append('image', file);
          
          try {
            // Show some loading indicator
            const range = editor.getSelection(true);
            editor.insertText(range.index, 'Uploading image... ', 'user');
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            // Remove the loading text
            editor.deleteText(range.index, 'Uploading image... '.length);
            
            if (!response.ok) throw new Error('Upload failed');
            
            const result = await response.json();
            
            // Insert the image
            editor.insertEmbed(range.index, 'image', result.imageUrl);
            editor.setSelection(range.index + 1);
          } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
          }
        };
      });
      
      setIsReady(true);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div className="editor-container">
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={setContent}
        modules={modules}
        theme="snow"
        placeholder="Write something..."
      />
      {!isReady && <div>Loading editor...</div>}
    </div>
  );
}

export default ImageUploadEditor;
```

## Drag and Drop Support

To enable drag and drop uploads:

```jsx
useEffect(() => {
  if (!quillRef.current) return;
  
  const editor = quillRef.current.getEditor();
  const element = editor.root;
  
  // Handle drop events
  element.addEventListener('drop', async (e) => {
    e.preventDefault();
    
    if (e.dataTransfer?.files?.length) {
      const file = e.dataTransfer.files[0];
      if (!file.type.match(/^image\//)) return;
      
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        const range = editor.getSelection() || { index: 0 };
        editor.insertEmbed(range.index, 'image', data.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  });
  
  // Prevent default browser behavior
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
}, []);
```

## Conclusion

By using the approach of registering the handler after the component mounts (via `useEffect`), you can reliably implement server-side image uploads in React-Quill without crashing the editor.

The key is to:
1. Set up a basic toolbar with an image button
2. Let Quill fully initialize
3. Register your custom handler after initialization
4. Handle image uploads properly with error handling

This approach is more stable than trying to include the handler directly in the modules configuration. 