import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast, { Toaster } from 'react-hot-toast';

// Import local components 
// In a real app, this would be: import { QuillImageUploader, applyQuillStyles } from 'react-quill-image-uploader';
import { QuillImageUploader, applyQuillStyles } from '../src';

function App() {
  const [content, setContent] = useState('');
  const quillRef = useRef(null);
  
  // Apply custom styles for images
  useEffect(() => {
    const cleanup = applyQuillStyles();
    return cleanup;
  }, []);
  
  // Mock image upload function - replace with your actual API call
  const uploadImage = async (file) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock response with a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Return object with image URL in the format { url: '...' }
        resolve({ url: reader.result });
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Custom toast handler for notifications
  const handleToast = (type, message) => {
    switch (type) {
      case 'loading':
        return toast.loading(message, { id: 'image-upload' });
      case 'success':
        return toast.success(message, { id: 'image-upload' });
      case 'error':
        return toast.error(message, { id: 'image-upload' });
      default:
        return console.log(`[${type}] ${message}`);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>React Quill Image Uploader Demo</h1>
      <p>
        This example demonstrates how to use the QuillImageUploader component to add 
        image upload functionality to a ReactQuill editor.
      </p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Editor Example</h2>
        <div 
          style={{ 
            position: 'relative', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          {/* Image Uploader Component */}
          <QuillImageUploader 
            quillRef={quillRef}
            uploadFunction={uploadImage}
            toastFunction={handleToast}
            buttonPosition="top-right"
          />
          
          {/* ReactQuill Editor */}
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{
              toolbar: {
                container: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'align': [] }],
                  ['link'], // Note: We've removed 'image' from the default toolbar
                  ['clean']
                ]
              }
            }}
            style={{ height: '300px' }}
          />
        </div>
        
        <h3>Output HTML:</h3>
        <div 
          style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '10px',
            backgroundColor: '#f9f9f9',
            maxHeight: '200px',
            overflow: 'auto'
          }}
        >
          <pre>{content}</pre>
        </div>
        
        <h3>Instructions:</h3>
        <ol>
          <li>Click the image button in the top-right corner</li>
          <li>Select an image file</li>
          <li>The image will be uploaded and inserted at the cursor position</li>
        </ol>
        
        <h3>Preview:</h3>
        <div 
          style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '20px',
            backgroundColor: '#fff',
            minHeight: '100px'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      
      {/* Toast notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App; 