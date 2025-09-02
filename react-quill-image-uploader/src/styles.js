/**
 * Apply custom styles for ReactQuill images
 * 
 * @returns {Function} Cleanup function to remove styles when component unmounts
 */
export const applyQuillStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .ql-editor img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 10px 0;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .quill-image-uploader-button {
      position: absolute;
      z-index: 100;
      background-color: #f8f9fa;
    }
    .quill-custom-button {
      cursor: pointer;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
}; 