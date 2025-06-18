// Test script to manually test Cloudinary upload
// Run this in browser console on your app

const testCloudinaryUpload = async () => {
  const cloudName = 'dujom2jk3';
  const uploadPreset = 'hyperlocal_b2b';
  
  console.log('Testing Cloudinary configuration...');
  console.log('Cloud Name:', cloudName);
  console.log('Upload Preset:', uploadPreset);
  
  // Create a test file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('Selected file:', file.name, file.size, file.type);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('Upload URL:', uploadUrl);
    
    try {
      console.log('Uploading...');
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('SUCCESS! Upload response:', data);
        console.log('Image URL:', data.secure_url);
        
        // Test if image loads
        const img = new Image();
        img.onload = () => console.log('✅ Image loads successfully!');
        img.onerror = () => console.log('❌ Image failed to load');
        img.src = data.secure_url;
        
      } else {
        const errorText = await response.text();
        console.error('FAILED! Error response:', errorText);
      }
    } catch (error) {
      console.error('NETWORK ERROR:', error);
    }
  };
  
  input.click();
};

// Export for manual testing
window.testCloudinaryUpload = testCloudinaryUpload;
console.log('Run testCloudinaryUpload() to test the upload');
