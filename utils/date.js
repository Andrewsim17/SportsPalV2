// Helper function to format time ago
export const formatTimeAgo = (dateString) => {
   if (!dateString) return '';
   try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      
      // Handle potential future dates or invalid dates gracefully
      if (seconds < 0 || isNaN(date.getTime())) {
        return 'Just now'; 
      }
      
      let interval = seconds / 31536000; // Years
      if (interval > 1) return Math.floor(interval) + "y ago";
      
      interval = seconds / 2592000; // Months
      if (interval > 1) return Math.floor(interval) + "mo ago";
      
      interval = seconds / 86400; // Days
      if (interval > 1) return Math.floor(interval) + "d ago";
      
      interval = seconds / 3600; // Hours
      if (interval > 1) return Math.floor(interval) + "h ago";
      
      interval = seconds / 60; // Minutes
      if (interval > 1) return Math.floor(interval) + "m ago";
      
      // Seconds or just now
      return Math.max(0, Math.floor(seconds)) + "s ago"; 
      
   } catch (e) {
      console.error("Error formatting time ago:", e);
      return 'Just now'; // Fallback for any unexpected error
   }
}; 