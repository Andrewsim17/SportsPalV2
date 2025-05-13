import { supabase } from './supabase';

/**
 * Get a public URL for a file in Supabase Storage
 * @param {string} path - The path to the file in storage, including bucket
 * @returns {string} - The public URL for the file
 */
export const getPublicUrl = (path) => {
  if (!path) return null;
  
  try {
    // Handle cases where the path is already a complete URL
    if (path.startsWith('http')) return path;
    
    // Extract bucket and filePath from the path (format: 'bucket/filePath')
    let bucket, filePath;
    if (path.includes('/')) {
      [bucket, ...filePath] = path.split('/');
      filePath = filePath.join('/');
    } else {
      bucket = 'venues'; // Default bucket if not specified
      filePath = path;
    }
    
    // Get the public URL for the file
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    
    console.log(`Generated public URL for ${path}:`, data?.publicUrl);
    return data?.publicUrl;
  } catch (error) {
    console.error('Error generating public URL:', error);
    return null;
  }
};

/**
 * Validates a URL to ensure it's properly formatted
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Basic URL validation
  try {
    // Check if starts with http(s)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // Try to create a URL object to validate
    new URL(url);
    return true;
  } catch (e) {
    console.error('Invalid URL:', url, e);
    return false;
  }
};

/**
 * Process venue images by converting storage paths to public URLs
 * @param {array|string} images - Array of image paths or JSON string
 * @returns {array} - Array of public URLs
 */
export const processVenueImages = (images) => {
  console.log('Processing raw images data:', typeof images, images);
  
  // Default fallback - using Picsum which is more reliable than placeholder.com
  const defaultImage = 'https://picsum.photos/300/200?text=No+Image';
  
  // If it's falsy, return default
  if (!images) {
    console.log('No images provided, using default');
    return [defaultImage];
  }
  
  // If it's already an array and has items, validate each URL
  if (Array.isArray(images) && images.length > 0) {
    console.log('Image data is a valid array with', images.length, 'items');
    
    // Filter out invalid URLs
    const validImages = images
      .filter(img => isValidUrl(img))
      .map(img => {
        // Replace via.placeholder.com with picsum.photos for reliability
        if (img.includes('via.placeholder.com')) {
          const size = img.match(/\/(\d+)\//);
          if (size && size[1]) {
            return `https://picsum.photos/${size[1]}/200`;
          }
          return 'https://picsum.photos/300/200';
        }
        return img.trim();
      });
    
    return validImages.length > 0 ? validImages : [defaultImage];
  }
  
  // If it's a string, try to parse it as JSON
  if (typeof images === 'string') {
    // If it's a URL, validate and return it
    if (images.startsWith('http')) {
      console.log('Found single image URL string');
      // Replace placeholder.com with picsum if needed
      if (images.includes('via.placeholder.com')) {
        const size = images.match(/\/(\d+)\//);
        if (size && size[1]) {
          return [`https://picsum.photos/${size[1]}/200`];
        }
        return ['https://picsum.photos/300/200'];
      }
      return isValidUrl(images) ? [images.trim()] : [defaultImage];
    }
    
    // Try to parse as JSON
    try {
      const parsedImages = JSON.parse(images);
      console.log('Successfully parsed images string to', Array.isArray(parsedImages) ? 'array' : typeof parsedImages);
      
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        const validImages = parsedImages
          .filter(img => isValidUrl(img))
          .map(img => {
            // Replace via.placeholder.com with picsum.photos
            if (img.includes('via.placeholder.com')) {
              const size = img.match(/\/(\d+)\//);
              if (size && size[1]) {
                return `https://picsum.photos/${size[1]}/200`;
              }
              return 'https://picsum.photos/300/200';
            }
            return img.trim();
          });
        
        return validImages.length > 0 ? validImages : [defaultImage];
      } else if (parsedImages && typeof parsedImages === 'object' && parsedImages.url) {
        let url = parsedImages.url;
        if (url.includes('via.placeholder.com')) {
          const size = url.match(/\/(\d+)\//);
          if (size && size[1]) {
            url = `https://picsum.photos/${size[1]}/200`;
          } else {
            url = 'https://picsum.photos/300/200';
          }
        }
        return isValidUrl(url) ? [url.trim()] : [defaultImage];
      }
    } catch (e) {
      console.error('Error parsing venue images:', e);
      return [defaultImage];
    }
  }
  
  // If it's an object with a url property
  if (images && typeof images === 'object' && images.url) {
    console.log('Found image object with URL');
    let url = images.url;
    if (url.includes('via.placeholder.com')) {
      const size = url.match(/\/(\d+)\//);
      if (size && size[1]) {
        url = `https://picsum.photos/${size[1]}/200`;
      } else {
        url = 'https://picsum.photos/300/200';
      }
    }
    return isValidUrl(url) ? [url.trim()] : [defaultImage];
  }
  
  // Fallback
  console.log('Using default placeholder image');
  return [defaultImage];
}; 