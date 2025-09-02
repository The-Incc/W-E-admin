# Getting Started with React Quill Image Uploader

This guide will help you quickly set up and use the React Quill Image Uploader package in your React application.

## Installation

```bash
npm install react-quill-image-uploader
# or
yarn add react-quill-image-uploader
```

Make sure you also have the peer dependencies installed:

```bash
npm install react react-dom react-quill
```

## Quick Start

Here's a minimal example to get you started:

```jsx
import React, { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { QuillImageUploader, applyQuillStyles } from 'react-quill-image-uploader';

function Editor() {
  const [content, setContent] = useState('');
  const quillRef = useRef(null);
  
  // Apply custom styles for better image display
  useEffect(() => {
    const cleanup = applyQuillStyles();
    return cleanup;
  }, []);
  
  // Your image upload function - replace with your actual API call
  const handleImageUpload = async (file) => {
    // Example implementation:
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('https://your-api.com/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    // Return the URL in the format { url: '...' }
    const data = await response.json();
    return data;
  };
  
  return (
    <div style={{ position: 'relative' }}>
      {/* Add the image uploader component */}
      <QuillImageUploader 
        quillRef={quillRef}
        uploadFunction={handleImageUpload}
      />
      
      {/* Regular ReactQuill component */}
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={setContent}
        modules={{
          toolbar: {
            container: [
              ['bold', 'italic', 'underline'],
              ['link'], // Note: We removed 'image' here since we handle it separately
              ['clean']
            ]
          }
        }}
      />
    </div>
  );
}

export default Editor;
```

## Usage with Toast Notifications

For a better user experience, you can add toast notifications:

```jsx
import toast from 'react-hot-toast';

// Inside your component:
const handleToast = (type, message) => {
  switch (type) {
    case 'loading': return toast.loading(message, { id: 'image-upload' });
    case 'success': return toast.success(message, { id: 'image-upload' });
    case 'error': return toast.error(message, { id: 'image-upload' });
    default: return console.log(message);
  }
};

<QuillImageUploader 
  quillRef={quillRef}
  uploadFunction={handleImageUpload}
  toastFunction={handleToast}
/>
```

## Customization Options

### Button Position

You can change the position of the upload button:

```jsx
<QuillImageUploader 
  buttonPosition="top-left" // or "top-right" (default)
  // other props
/>
```

### Custom Styling

You can add custom styles to the button container:

```jsx
<QuillImageUploader 
  buttonStyles={{ 
    backgroundColor: '#f0f0f0', 
    borderRadius: '8px',
    // any CSS properties
  }}
  // other props
/>
```

### Custom Icon

You can replace the default icon with your own:

```jsx
import { ImageIcon } from 'your-icon-library';

<QuillImageUploader 
  customIcon={<ImageIcon size={18} />}
  // other props
/>
```

## Need More Help?

Check the full documentation in the README.md file for more advanced usage and API details.

## Running the Example

The package includes an example app that you can run to see it in action:

```bash
# Clone the repository
git clone https://github.com/yourusername/react-quill-image-uploader.git

# Navigate to the package directory
cd react-quill-image-uploader

# Run the example app
./run-example.sh
```

This will start a development server at [http://localhost:3000](http://localhost:3000) where you can see the component in action. 