# The Restaurant App

A competitive restaurant application with innovative features to enhance market entry.

## Architecture

- **Backend**: Django REST Framework (Python)
- **Web App**: React
- **Mobile App**: React Native
- **Shared API**: Common Django REST API for both frontend applications

## Project Structure

```
The Restaurant/
├── backend/          # Django REST API
├── webapp/           # React Web Application
├── mobile/           # React Native Mobile App
├── docs/            # Project Documentation
└── README.md        # This file
```

## Competitive Features

### 🚀 Unique Differentiators
1. **AI-Powered Menu Assistant** - Smart recommendations based on dietary preferences
2. **Social Dining Hub** - Find dining partners, group ordering, bill splitting
3. **Live Kitchen Cam** - Real-time food preparation transparency
4. **Dynamic Pricing** - Real-time pricing based on demand and inventory
5. **Gamified Loyalty** - Interactive challenges and social leaderboards
6. **AR Menu Experience** - 3D food visualization and nutritional info
7. **Predictive Wait Times** - ML-based accurate wait time predictions
8. **Sustainable Impact Tracker** - Environmental impact of food choices

## Quick Start

### Backend (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Web App (React)
```bash
cd webapp
npm install
npm start
```

### Mobile App (React Native)
```bash
cd mobile
npm install
npm run android  # or npm run ios
```

## API Endpoints

The shared Django REST API serves both web and mobile applications with consistent endpoints for:

- Authentication & User Management
- Restaurant & Menu Management
- Order Processing
- Real-time Updates
- AI Recommendations
- Social Features

## Development Setup

1. Clone this repository
2. Set up the backend Django server
3. Install dependencies for web and mobile apps
4. Configure environment variables
5. Start development servers

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is proprietary software developed for [Client Name].