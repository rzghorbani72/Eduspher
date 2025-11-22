/**
 * Calculate the relative luminance of a color
 * Returns a value between 0 (black) and 1 (white)
 */
function getLuminance(hex: string): number {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.length === 3 ? color[0].repeat(2) : color.substring(0, 2), 16) / 255;
  const g = parseInt(color.length === 3 ? color[1].repeat(2) : color.substring(2, 4), 16) / 255;
  const b = parseInt(color.length === 3 ? color[2].repeat(2) : color.substring(4, 6), 16) / 255;
  
  // Apply gamma correction
  const [rLinear, gLinear, bLinear] = [r, g, b].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Determine if text should be light or dark based on background color
 * Returns 'white' for dark backgrounds, 'black' for light backgrounds
 */
export function getContrastColor(backgroundColor: string): 'white' | 'black' {
  if (!backgroundColor) return 'black';
  
  // Handle CSS variables
  if (backgroundColor.startsWith('var(')) {
    // Try to get computed value
    if (typeof window !== 'undefined') {
      const tempEl = document.createElement('div');
      tempEl.style.backgroundColor = backgroundColor;
      document.body.appendChild(tempEl);
      const computed = window.getComputedStyle(tempEl).backgroundColor;
      document.body.removeChild(tempEl);
      backgroundColor = computed;
    }
  }
  
  // Handle rgb/rgba format
  const rgbMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]) / 255;
    const g = parseInt(rgbMatch[2]) / 255;
    const b = parseInt(rgbMatch[3]) / 255;
    
    const [rLinear, gLinear, bLinear] = [r, g, b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    return luminance > 0.5 ? 'black' : 'white';
  }
  
  // Handle hex format
  if (backgroundColor.startsWith('#')) {
    const luminance = getLuminance(backgroundColor);
    return luminance > 0.5 ? 'black' : 'white';
  }
  
  // Default to black for unknown formats
  return 'black';
}




