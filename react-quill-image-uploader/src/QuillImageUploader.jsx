import React, { useEffect } from 'react';

/**
 * QuillImageUploader - A component that adds image upload functionality to ReactQuill
 * 
 * @param {Object} props - Component props
 * @param {Object} props.quillRef - React ref to the ReactQuill component
 * @param {Function} props.uploadFunction - Async function to handle image upload, should return {url} or {image: {url}}
 * @param {String} props.buttonPosition - Position of the button ('top-right' or 'top-left')
 * @param {Function} props.toastFunction - Function to show notifications (type, message) => {}
 * @param {Object} props.buttonStyles - Additional styles for the button container
 * @param {React.ReactNode} props.customIcon - Custom icon component
 * @returns {React.ReactNode}
 */
const QuillImageUploader = ({ 
  quillRef, 
  uploadFunction, 
  buttonPosition = 'top-right',
  toastFunction,
  customIcon,
  buttonStyles = {}
}) => {
  // Default toast function if none provided
  const showToast = toastFunction || ((type, message) => {
    console.log(`[${type}] ${message}`);
  });

  // Image upload handler
  const handleImageUpload = (editor) => {
    console.log('handleImageUpload called');
    
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.style.display = 'none';
    document.body.appendChild(input);
    
    // Trigger file selection
    input.click();
    
    // Handle file selection
    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }
      
      console.log('File selected:', file.name);
      
      try {
        showToast('loading', 'Uploading image...');
        console.log('Calling upload function');
        
        // Upload image to server
        const response = await uploadFunction(file);
        console.log('Upload response received:', response);
        
        const imageUrl = response.image?.url || response.url;
        
        if (imageUrl) {
          console.log('Image URL received:', imageUrl);
          
          // Get current cursor position
          const range = editor.getSelection(true);
          const index = range ? range.index : editor.getLength();
          
          console.log('Inserting image at position:', index);
          
          // Insert image at cursor position
          editor.insertEmbed(index, 'image', imageUrl);
          
          // Move cursor after the image
          editor.setSelection(index + 1);
          editor.focus();
          
          showToast('success', 'Image uploaded successfully');
        } else {
          throw new Error('No image URL received from server');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('error', `Failed to upload image: ${error.message || 'Unknown error'}`);
      }
      
      // Clean up the input element
      document.body.removeChild(input);
    };
  };
  
  // Setup custom image handler when the component mounts
  useEffect(() => {
    if (!quillRef?.current) {
      console.log('QuillRef not initialized yet');
      return;
    }
    
    console.log('Setting up image handler for Quill editor');
    
    // Function to set up the image handler
    const setupImageHandler = () => {
      try {
        const editor = quillRef.current.getEditor();
        if (!editor) {
          console.error('Failed to get Quill editor instance');
          return;
        }
        
        const toolbar = editor.getModule('toolbar');
        if (!toolbar) {
          console.error('Failed to get Quill toolbar module');
          return;
        }
        
        console.log('Successfully got Quill toolbar, adding image handler');
        
        // Add custom image handler
        toolbar.addHandler('image', function() {
          console.log('Toolbar image button clicked');
          handleImageUpload(editor);
        });
        
        console.log('Image handler successfully attached to toolbar');
      } catch (error) {
        console.error('Error setting up image handler:', error);
      }
    };
    
    // Try immediately and then with delays to ensure Quill is fully initialized
    setupImageHandler();
    const shortDelay = setTimeout(setupImageHandler, 300);
    const longDelay = setTimeout(setupImageHandler, 1000);
    
    return () => {
      clearTimeout(shortDelay);
      clearTimeout(longDelay);
    };
  }, [quillRef]);

  // Calculate button position styles
  const getPositionStyles = () => {
    switch (buttonPosition) {
      case 'top-right':
        return {
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 100,
          padding: '4px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          borderLeft: '1px solid #ddd',
          borderBottomLeftRadius: '4px'
        };
      case 'top-left':
        return {
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 100,
          padding: '4px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          borderRight: '1px solid #ddd',
          borderBottomRightRadius: '4px'
        };
      default:
        return {
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 100,
          padding: '4px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          borderLeft: '1px solid #ddd',
          borderBottomLeftRadius: '4px'
        };
    }
  };

  // Merge default styles with custom styles
  const containerStyles = {
    ...getPositionStyles(),
    ...buttonStyles
  };
  
  // Generic upload button (framework-agnostic)
  const renderButton = () => {
    if (customIcon) {
      return customIcon;
    }
    
    // Default button with inline styles for framework-independence
    return (
      <button
        type="button"
        onClick={() => {
          if (quillRef?.current) {
            handleImageUpload(quillRef.current.getEditor());
          } else {
            console.error('quillRef not available');
          }
        }}
        style={{
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Upload Image"
      >
        {/* Simple SVG icon for image upload */}
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </button>
    );
  };

  return (
    <div style={containerStyles}>
      {renderButton()}
    </div>
  );
};

export default QuillImageUploader; 