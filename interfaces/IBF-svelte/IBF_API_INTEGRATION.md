# IBF API Integration Guide

This guide explains how to connect your IBF Svelte dashboard to the real IBF API for live disaster forecasting data.

## 🔄 Current Status

Your dashboard currently supports three data sources:

1. **Mock Data** (default) - Simulated data for development
2. **IBF API** (new) - Real IBF system data from 510.global
3. **Custom API** - Your own backend service

## 🚀 Quick Start: Enable IBF API

### Step 1: Update Environment Configuration

Create or update `.env.local` in your project root:

```bash
# Enable IBF API
VITE_USE_IBF_API=true
VITE_USE_MOCK_DATA=false

# Keep other settings as needed
VITE_DISABLE_AUTHENTICATION=true
VITE_DEBUG_MODE=true
VITE_SHOW_DEBUG_PANEL=true
```

### Step 2: Restart Development Server

```bash
npm run dev
```

### Step 3: Test the Connection

1. Open your dashboard at `http://localhost:5173`
2. Look for the "🔧 API Debug Panel" at the bottom
3. Click "Test IBF API" to verify connectivity
4. Check the test results for each endpoint

## 📊 IBF API Endpoints

Your integration now supports these IBF API endpoints:

### Countries
- `GET /countries` - List all countries
- `GET /countries/{countryCode}` - Country details

### Disaster Types
- Retrieved from country settings
- Each country has specific disaster types with lead times

### Events & Triggers
- `GET /event/{country}/{disasterType}` - Active events/triggers
- `GET /event/{country}/{disasterType}/data` - Event data with admin areas

### Administrative Areas
- `GET /admin-area-data/{country}/{adminLevel}` - Admin boundaries
- `GET /admin-area-data/{country}/{adminLevel}/geometry` - GeoJSON geometry

### Metadata & Indicators
- `GET /metadata/{country}/{disaster}/{leadTime}` - Metadata
- `GET /indicators/{country}/{disaster}/{leadTime}/{indicator}` - Indicator data

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_IBF_API` | `false` | Enable IBF API integration |
| `VITE_USE_MOCK_DATA` | `true` | Enable mock data (overrides IBF API) |
| `VITE_DEBUG_MODE` | `true` | Enable debug logging |
| `VITE_SHOW_DEBUG_PANEL` | `true` | Show API debug panel |

### Data Source Priority

The system chooses data sources in this order:

1. **Mock Data** (if `VITE_USE_MOCK_DATA=true`)
2. **IBF API** (if `VITE_USE_IBF_API=true`)
3. **Custom API** (fallback to `VITE_API_URL`)

## 🗺️ Map Integration

### Event Visualization

IBF events are transformed and displayed on the map as:

- **Event Markers** - Location points for active events
- **Admin Area Boundaries** - Affected administrative areas
- **Severity Indicators** - Color-coded by threat level

### Layer Support

- **Administrative Areas** - Country boundaries and admin levels
- **Active Events** - Current disaster triggers
- **Risk Indicators** - Vulnerability and exposure data

## 🔐 Authentication

### Current Setup

The IBF API integration uses your existing Azure AD authentication:

```typescript
// Headers sent to IBF API
{
  'Authorization': `Bearer ${azureAdToken}`,
  'Content-Type': 'application/json'
}
```

### Authentication Requirements

- The IBF API may require specific permissions
- Contact the 510 team for API access credentials
- Some endpoints might be publicly accessible for testing

## 🛠️ Development Workflow

### 1. Development with Mock Data

```bash
# .env.local
VITE_USE_MOCK_DATA=true
VITE_USE_IBF_API=false
```

- Fast development
- No network dependencies
- Predictable test data

### 2. Testing with IBF API

```bash
# .env.local
VITE_USE_IBF_API=true
VITE_USE_MOCK_DATA=false
```

- Real data testing
- Network connectivity required
- May need VPN or proxy for some networks

### 3. Production Deployment

```bash
# .env.production
VITE_USE_IBF_API=true
VITE_USE_MOCK_DATA=false
VITE_DISABLE_AUTHENTICATION=false
```

## 🔍 Debugging

### API Debug Panel

The dashboard includes a built-in API testing panel:

1. **Current Configuration** - Shows active data source
2. **Connection Testing** - Test each API endpoint
3. **Results Display** - Detailed success/error information
4. **Instructions** - Step-by-step setup guide

### Console Logging

Enable detailed logging:

```bash
VITE_DEBUG_MODE=true
```

Look for these log messages:
- `IBF API Request: /countries`
- `Using IBF API for countries`
- `IBF API Success: /countries`

### Common Issues

**CORS Errors:**
- IBF API may not allow browser requests
- Contact 510 team about CORS configuration
- Consider proxy setup for development

**Authentication Errors:**
- IBF API may require specific tokens
- Check with 510 team about API access
- Verify Azure AD token format

**Network Errors:**
- Check VPN/proxy settings
- Verify `https://ibf-test.510.global` accessibility
- Test with browser developer tools

## 📈 Performance

### Caching Strategy

The IBF API service includes intelligent caching:

- **Countries**: 30 minutes
- **Admin Areas**: 20 minutes
- **Metadata**: 15 minutes
- **Events**: 5 minutes (frequently changing)
- **Health Check**: 1 minute

### Data Transformation

IBF API data is automatically transformed to match your app's format:

```typescript
// IBF Country → App Country
{
  countryCodeISO3: 'UGA',
  countryName: 'Uganda',
  countryBounds: [[28.8, -1.5], [35.0, 4.2]]
}

// IBF Events → App Events
{
  id: 'UGA_floods_area123',
  disasterType: 'floods',
  placeName: 'Kampala',
  severity: 'High',
  date: '2024-01-15T10:30:00Z'
}
```

## 🚀 Next Steps

### Immediate Actions

1. **Test IBF API** - Use the debug panel to verify connectivity
2. **Check Data Quality** - Compare IBF data with mock data
3. **Verify Map Display** - Ensure events render correctly

### Future Enhancements

1. **Real-time Updates** - WebSocket integration for live events
2. **Offline Support** - Cache IBF data for offline use
3. **Custom Indicators** - Add organization-specific data layers
4. **Advanced Filtering** - Filter events by severity, date, etc.

## 📞 Support

### IBF API Issues
- Contact: 510 Global team
- Documentation: https://ibf-test.510.global/docs
- API Base URL: https://ibf-test.510.global/api

### Dashboard Issues
- Check browser console for errors
- Use the API Debug Panel for diagnostics
- Verify environment variable configuration

## 🎯 Production Checklist

Before deploying to production:

- [ ] Test all IBF API endpoints
- [ ] Verify authentication works
- [ ] Check CORS configuration
- [ ] Test with real user accounts
- [ ] Monitor API response times
- [ ] Set up error logging
- [ ] Configure caching headers
- [ ] Test offline behavior

Your IBF dashboard is now ready to connect to real disaster forecasting data! 🌍
