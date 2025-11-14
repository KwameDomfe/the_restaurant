# The Restaurant Backend - Django REST API

Django REST Framework backend providing unified API for both web and mobile applications.

## Features

- User Authentication & Social Connections
- Restaurant & Menu Management  
- Real-time Order Tracking
- Social Dining Features
- AI-Powered Recommendations
- Payment Processing
- Admin Dashboard

## Quick Start

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py createsuperuser

# Load sample data
python manage.py loaddata fixtures/sample_data.json

# Run development server
python manage.py runserver
```

## API Documentation

Once running, visit:
- API Root: http://127.0.0.1:8000/api/
- Admin Panel: http://127.0.0.1:8000/admin/
- API Docs: http://127.0.0.1:8000/api/docs/

## Environment Variables

Create `.env` file with:
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/therestaurant
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=your-stripe-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```