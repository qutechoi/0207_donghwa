/**
 * Validate image file
 */
export function validateImageFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file) {
    return { isValid: false, error: 'Please select a file.' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG, PNG, and WebP formats are supported.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be 5MB or less.',
    };
  }

  return { isValid: true, error: null };
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
