# Google Vision OCR Integration

## Overview
The TMS application now includes Google Vision API integration for OCR (Optical Character Recognition) functionality. This allows you to upload rate confirmation documents and automatically extract text from them.

## Configuration

The Google Vision API key has been added to the CONFIG object in `main.js`:

```javascript
const CONFIG = {
    api: {
        googleVisionKey: 'AIzaSyDqPRd6ol1hIdPH5bm0ujmuJ8V6W0yPpSA'
    }
};
```

## Usage

### Basic OCR Function

Use the `Utils.processRateConfirmation(file)` function to extract text from images:

```javascript
// Example: Process a file upload
const fileInput = document.getElementById('rateConfirmationUpload');
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    if (file) {
        try {
            Utils.showNotification('Processing document...', 'info');
            const extractedText = await Utils.processRateConfirmation(file);
            console.log('Extracted text:', extractedText);
            Utils.showNotification('Text extracted successfully!', 'success');
            
            // Do something with the extracted text
            // For example, parse load details, amounts, dates, etc.
            
        } catch (error) {
            console.error('OCR failed:', error);
            Utils.showNotification('Failed to extract text from document', 'error');
        }
    }
});
```

### Integration Example: Load Creation

Here's how you might integrate OCR into the load creation form:

```javascript
// Add to loads.html or wherever you create loads
async function handleRateConfirmationUpload(file) {
    try {
        // Show loading indicator
        Utils.showNotification('Reading rate confirmation...', 'info');
        
        // Extract text using OCR
        const text = await Utils.processRateConfirmation(file);
        
        // Parse the extracted text for load details
        // This is a simple example - you'll need to customize based on your rate confirmation format
        const loadData = parseRateConfirmation(text);
        
        // Auto-fill the load form
        if (loadData.loadNumber) {
            document.getElementById('loadNumber').value = loadData.loadNumber;
        }
        if (loadData.rate) {
            document.getElementById('rate').value = loadData.rate;
        }
        if (loadData.pickupLocation) {
            document.getElementById('pickupCity').value = loadData.pickupLocation;
        }
        if (loadData.deliveryLocation) {
            document.getElementById('deliveryCity').value = loadData.deliveryLocation;
        }
        
        Utils.showNotification('Rate confirmation processed!', 'success');
        
    } catch (error) {
        console.error('Error processing rate confirmation:', error);
        Utils.showNotification('Failed to process rate confirmation', 'error');
    }
}

// Helper function to parse extracted text
function parseRateConfirmation(text) {
    const data = {};
    
    // Example parsing logic - customize based on your rate confirmation format
    // Look for load number (e.g., "Load #12345" or "Load: 12345")
    const loadNumberMatch = text.match(/Load\s*[#:]?\s*(\d+)/i);
    if (loadNumberMatch) {
        data.loadNumber = loadNumberMatch[1];
    }
    
    // Look for rate (e.g., "$1,500.00" or "Rate: 1500")
    const rateMatch = text.match(/\$?([\d,]+\.?\d*)/);
    if (rateMatch) {
        data.rate = rateMatch[1].replace(/,/g, '');
    }
    
    // Add more parsing logic as needed...
    
    return data;
}
```

### HTML Integration

Add a file input to your load form:

```html
<div class="form-group">
    <label class="form-label">Upload Rate Confirmation (Optional)</label>
    <input type="file" 
           id="rateConfirmationUpload" 
           accept="image/*,.pdf"
           class="form-input"
           onchange="handleRateConfirmationUpload(this.files[0])">
    <p class="form-help">Upload a rate confirmation to auto-fill load details</p>
</div>
```

## Supported File Types

The OCR function works with:
- **Images**: JPG, JPEG, PNG, GIF, BMP, WebP
- **PDFs**: Single-page PDFs (multi-page requires additional handling)

## API Limits

Google Vision API has usage limits:
- **Free tier**: 1,000 requests per month
- **Paid tier**: Pay per request after free tier

Monitor your usage at: https://console.cloud.google.com/apis/dashboard

## Error Handling

The function includes comprehensive error handling:

```javascript
try {
    const text = await Utils.processRateConfirmation(file);
    // Success
} catch (error) {
    // Handle errors:
    // - Invalid file format
    // - Network errors
    // - API errors
    // - No text detected
    console.error('OCR Error:', error);
}
```

## Testing

To test the OCR functionality:

1. Open your browser's developer console (F12)
2. Create a test file input or use an existing one
3. Upload a rate confirmation image
4. Check the console for extracted text

Example test code:
```javascript
// Test in browser console
const testFile = document.querySelector('input[type="file"]').files[0];
Utils.processRateConfirmation(testFile)
    .then(text => console.log('Extracted:', text))
    .catch(err => console.error('Error:', err));
```

## Next Steps

1. **Customize parsing logic** based on your rate confirmation format
2. **Add validation** for extracted data
3. **Implement auto-fill** for load creation forms
4. **Add preview** to show extracted text before applying
5. **Store extracted text** with the load record for reference

## Security Note

⚠️ **Important**: The API key is currently embedded in the client-side code. For production use, consider:
- Using environment variables
- Implementing a backend proxy to hide the API key
- Setting up API key restrictions in Google Cloud Console
