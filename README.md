# ATS FREIGHT LLC - Transportation Management System (TMS)

## Overview
A comprehensive, professional-grade Transportation Management System built for ATS FREIGHT LLC. This web application provides complete trucking company management including load dispatching, driver settlements, IFTA reporting, and expense tracking.

## Features

### Core Functionality
- **User Authentication**: Role-based access control (Admin, Dispatcher, Driver)
- **Load Management**: Complete CRUD operations for freight loads
- **Driver Management**: Three payment types (per mile, percentage, flat rate)
- **Driver Settlements**: Automated payment calculations and history
- **Invoicing System**: Customer invoicing with PDF generation
- **Expense Tracking**: Operational expenses with OCR receipt processing
- **Fleet Management**: Truck specifications and maintenance tracking
- **Customer Management**: Customer profiles and payment terms
- **IFTA Reporting**: Quarterly fuel tax reports with state-by-state breakdown
- **Dashboard Analytics**: Real-time statistics and performance metrics

### Technical Features
- **Mileage Calculation**: Google Maps API integration for accurate routing
- **OCR Document Processing**: Google Vision API for automated data extraction
- **PDF Generation**: Professional reports and invoices
- **Mobile Responsive**: Works on all devices
- **Progressive Web App**: Offline functionality for key features

## Technology Stack

### Frontend
- **React.js**: Modern JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework
- **Plotly.js**: Interactive charts and graphs
- **Font Awesome**: Professional icons

### Backend
- **Firebase**: Authentication, Firestore database, Storage
- **Google Maps API**: Mileage and routing calculations
- **Google Vision API**: OCR document processing
- **jsPDF**: PDF generation for reports

### Database
- **Firebase Firestore**: NoSQL database
- **Firebase Storage**: File storage for documents and receipts

## File Structure

```
/mnt/okcomputer/output/
├── index.html              # Main dashboard
├── loads.html             # Load management
├── drivers.html           # Driver management
├── settlements.html       # Driver settlements
├── invoices.html          # Invoicing system
├── expenses.html          # Expense tracking
├── ifta.html              # IFTA reporting
├── main.js                # Core application logic
├── resources/             # Assets and documents
│   └── company-logo.png   # Company logo
├── database-schema.md     # Database design documentation
├── technical-answers.md   # Technical implementation answers
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js 16+ (for development tools)
- Firebase account
- Google Cloud account (for Maps and Vision APIs)
- Modern web browser

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd tms-ats-freight
   ```

2. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase configuration
   - Update `main.js` with your Firebase credentials

3. **Configure Google APIs**
   - Enable Google Maps API and Google Vision API
   - Create API keys in Google Cloud Console
   - Update `main.js` with your API keys

4. **Deploy to Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

5. **Alternative Deployment**
   - Upload all files to any web server
   - Ensure HTTPS is enabled for API functionality

## Configuration

### Firebase Configuration
Update the following in `main.js`:
```javascript
const CONFIG = {
    firebase: {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    api: {
        googleMapsKey: "YOUR_GOOGLE_MAPS_API_KEY",
        googleVisionKey: "YOUR_GOOGLE_VISION_API_KEY"
    }
};
```

### Company Configuration
Update company details in `main.js`:
```javascript
company: {
    name: 'ATS FREIGHT LLC',
    address: '3191 MORSE RD STE 15, COLUMBUS, OH 43231',
    phone: '(614) 254-0380',
    email: 'dispatch@atsfreight.com'
}
```

## Usage

### Getting Started
1. Navigate to the deployed URL
2. Create an admin account
3. Set up your company profile
4. Add drivers, trucks, and customers
5. Start creating loads and managing operations

### Key Workflows

#### Creating a Load
1. Click "Create New Load" on the Loads page
2. Enter pickup and delivery information
3. Assign driver and truck
4. Upload rate confirmation and BOL documents
5. System automatically calculates mileage using Google Maps

#### Driver Settlement
1. Navigate to Settlements page
2. Select driver and pay period
3. System automatically calculates earnings based on payment type
4. Review and approve settlement
5. Generate PDF report for driver

#### IFTA Reporting
1. Navigate to IFTA page
2. Select quarter and year
3. System generates state-by-state mileage breakdown
4. Review and file report with tax authorities
5. Export PDF for records

## API Integration

### Google Maps API
- **Directions API**: Calculate routes and distances
- **Distance Matrix API**: Mileage calculations
- **Geocoding API**: Address validation
- **Places API**: Location search

### Google Vision API
- **Text Detection**: Extract text from documents
- **Document Text Detection**: OCR for structured documents
- **Image Analysis**: Process uploaded receipts and BOLs

## Security

### Authentication
- Firebase Authentication with email/password
- Role-based access control
- Session management

### Data Security
- Firestore security rules
- HTTPS only communication
- Input validation and sanitization
- File upload restrictions

### Privacy
- No GPS tracking implemented
- Driver privacy protected
- Customer data encryption

## Performance

### Optimization
- Lazy loading of components
- Image compression
- CDN delivery of assets
- Efficient database queries

### Scalability
- Firebase scales automatically
- Modular architecture
- Cloud-native design
- Multi-tenant ready

## Maintenance

### Regular Tasks
- Monitor API usage and costs
- Update security rules
- Backup critical data
- Review and update dependencies

### Troubleshooting
- Check browser console for errors
- Verify API key permissions
- Monitor Firebase usage quotas
- Review authentication logs

## Support

### Documentation
- Database schema in `database-schema.md`
- Technical answers in `technical-answers.md`
- Code comments throughout

### Common Issues
1. **API Key Errors**: Verify Google API permissions
2. **Authentication Issues**: Check Firebase configuration
3. **Data Not Loading**: Verify Firestore security rules
4. **PDF Generation**: Ensure proper CORS settings

## Cost Analysis

### Development Costs
- **Core Development**: $15,000-25,000
- **Advanced Features**: $10,000-15,000
- **API Integration**: $3,000-5,000
- **Testing & Deployment**: $2,000-3,000
- **Total**: $30,000-48,000

### Monthly Operating Costs
- **Firebase Hosting**: $50-150
- **Google Maps API**: $50-150
- **Google Vision API**: $15-30
- **Domain & SSL**: $10-20
- **Total**: $125-350/month

## Future Enhancements

### Planned Features
- Mobile app for drivers
- ELD integration
- Real-time tracking (optional)
- Advanced analytics
- Automated dispatch suggestions
- Customer portal

### Scalability Features
- Multi-company support
- White-label options
- API for third-party integrations
- Advanced reporting
- Machine learning optimizations

## License

This software is proprietary to ATS FREIGHT LLC. All rights reserved.

## Contact

**ATS FREIGHT LLC**  
3191 MORSE RD STE 15  
COLUMBUS, OH 43231  
Phone: (614) 254-0380  
Email: dispatch@atsfreight.com

---

*Built with modern web technologies for the trucking industry*