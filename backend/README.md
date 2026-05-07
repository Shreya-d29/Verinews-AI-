# VeriNews AI - Node.js API Gateway

Optional Node.js Express server that acts as an API gateway between the frontend and Flask ML service.

## Features

- **API Gateway**: Routes requests between frontend and Flask ML service
- **Security**: Helmet, CORS, rate limiting
- **Performance**: Compression, request logging
- **Error Handling**: Comprehensive error handling and fallbacks
- **Batch Processing**: Support for analyzing multiple articles
- **Health Checks**: Service monitoring endpoints

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### POST /api/analyze

Analyze a single news article.

**Request:**
```json
{
  "headline": "Breaking: Scientists discover shocking method",
  "body": "Full article text here...",
  "source": "example.com"
}
```

**Response:**
```json
{
  "prediction": "Fake",
  "confidence": 0.847,
  "nlp": {
    "tokens": ["breaking", "scientists"],
    "top_keywords": ["shocking", "method"],
    "sentiment": -0.2,
    "entities": ["ORG: Scientists"],
    "clickbait_score": 0.6
  },
  "explanation": "High confidence fake classification...",
  "metadata": {
    "processed_at": "2024-01-01T12:00:00Z",
    "text_length": 150,
    "source": "example.com",
    "api_version": "1.0.0"
  }
}
```

### POST /api/analyze/batch

Analyze multiple articles (max 10 per request).

**Request:**
```json
{
  "articles": [
    {
      "headline": "Article 1 headline",
      "body": "Article 1 body",
      "source": "source1.com"
    },
    {
      "headline": "Article 2 headline", 
      "body": "Article 2 body",
      "source": "source2.com"
    }
  ]
}
```

### GET /api/metrics

Get ML model performance metrics.

### GET /health

Health check endpoint.

## Configuration

Environment variables:

- `PORT` - Server port (default: 3001)
- `FLASK_URL` - Flask ML service URL (default: http://localhost:5000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

## Architecture

```
Frontend → Node.js API Gateway → Flask ML Service
```

The Node.js gateway provides:
- Request validation and sanitization
- Error handling and fallbacks
- Rate limiting and security
- Request/response transformation
- Batch processing capabilities
- Monitoring and logging

## Production Deployment

For production deployment:

```bash
npm install --production
NODE_ENV=production npm start
```

Or use PM2:

```bash
npm install -g pm2
pm2 start server.js --name verinews-api
```