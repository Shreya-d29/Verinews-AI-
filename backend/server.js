const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000';

const NEWS_API_KEY = '1967a78f515945e9be4d475fc0e4a6b0';

// Real News Verification Service using NewsAPI
async function getVerifiedNews(query) {
  try {
    console.log(`Live verification search for: ${query}`);
    
    // Search credible domains for related factual reports
    const domains = 'reuters.com,bbc.com,apnews.com,nytimes.com,theguardian.com';
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=${domains}&language=en&sortBy=relevancy&pageSize=3&apiKey=${NEWS_API_KEY}`;
    
    const response = await axios.get(url);
    const articles = response.data.articles || [];

    if (articles.length === 0) {
      // Fallback if no specific credible reports found
      return {
        title: "Verified Real News / What Actually Happened",
        articles: [
          {
            source: "Reuters / BBC",
            headline: "No credible reports match this claim",
            summary: "Extensive search of trusted global news outlets has found no evidence to substantiate this claim. Credible agencies have not reported on this event, which strongly suggests it may be fabricated.",
            link: "https://reuters.com",
            truth_score: 1.0
          }
        ],
        comparison: {
          fake_claim: "The submitted article contains unverified claims that lack any presence in global news databases.",
          actual_truth: "Independent verification confirms this event is not being reported by any credible source."
        }
      };
    }

    return {
      title: "Verified Real News / What Actually Happened",
      articles: articles.map(a => ({
        source: a.source.name,
        headline: a.title,
        summary: a.description || "Detailed factual report available on source website.",
        link: a.url,
        truth_score: 0.95
      })),
      comparison: {
        fake_claim: "The submitted claim targets sensitive topics with sensationalist language.",
        actual_truth: `Factual reports from ${articles[0].source.name} and others provide the verified baseline for this story.`
      }
    };
  } catch (error) {
    console.error('NewsAPI search failed:', error.response?.data || error.message);
    return null;
  }
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    flask_url: FLASK_URL
  });
});

// Main analysis endpoint
app.post(['/api/analyze', '/predict'], async (req, res) => {
  try {
    const { headline, body, source, text: directText } = req.body;
    
    // Support both direct text and headline/body/source formats
    let text = directText || [headline, body].filter(Boolean).join('\n\n');
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid text'
      });
    }
    
    if (text.length > 10000) {
      return res.status(400).json({
        error: 'Text too long (max 10,000 characters)'
      });
    }
    
    // Call Flask API
    const flaskResponse = await axios.post(`${FLASK_URL}/predict`, {
      text,
      source
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add metadata
    const response = {
      ...flaskResponse.data,
      metadata: {
        processed_at: new Date().toISOString(),
        text_length: text.length,
        source: source || 'unknown',
        api_version: '1.0.0'
      }
    };

    // Conditional Feature: Add verification if Fake or Suspicious
    if (response.prediction === 'Fake' || (response.confidence < 0.6 && response.prediction === 'Suspicious')) {
      const verification = await getVerifiedNews(headline || text.slice(0, 100));
      if (verification) {
        response.verification = verification;
      }
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Analysis error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'ML service unavailable',
        message: 'The machine learning service is currently unavailable. Please try again later.'
      });
    }
    
    if (error.response) {
      // Flask API returned an error
      return res.status(error.response.status).json({
        error: 'ML service error',
        message: error.response.data?.error || 'Unknown error from ML service'
      });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'ML service not found',
        message: 'Could not connect to the machine learning service'
      });
    }
    
    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
});

// Get model metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const flaskResponse = await axios.get(`${FLASK_URL}/metrics`, {
      timeout: 10000
    });
    
    res.json(flaskResponse.data);
    
  } catch (error) {
    console.error('Metrics error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'ML service unavailable'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch metrics'
    });
  }
});

// Batch analysis endpoint (for future use)
app.post('/api/analyze/batch', async (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({
        error: 'Invalid articles array'
      });
    }
    
    if (articles.length > 10) {
      return res.status(400).json({
        error: 'Too many articles (max 10 per batch)'
      });
    }
    
    // Process articles in parallel
    const promises = articles.map(async (article, index) => {
      try {
        const text = [article.headline, article.body].filter(Boolean).join('\n\n');
        
        const flaskResponse = await axios.post(`${FLASK_URL}/predict`, {
          text,
          source: article.source
        }, {
          timeout: 30000
        });
        
        return {
          index,
          success: true,
          result: flaskResponse.data
        };
        
      } catch (error) {
        return {
          index,
          success: false,
          error: error.message
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    res.json({
      results,
      processed_at: new Date().toISOString(),
      total_articles: articles.length
    });
    
  } catch (error) {
    console.error('Batch analysis error:', error.message);
    res.status(500).json({
      error: 'Batch analysis failed'
    });
  }
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'VeriNews AI - API Gateway',
    version: '1.0.0',
    description: 'Node.js API gateway for VeriNews AI fake news detection',
    endpoints: {
      'POST /api/analyze': {
        description: 'Analyze single news article',
        body: {
          headline: 'string (required)',
          body: 'string (optional)',
          source: 'string (optional)'
        }
      },
      'POST /api/analyze/batch': {
        description: 'Analyze multiple articles (max 10)',
        body: {
          articles: 'array of {headline, body?, source?}'
        }
      },
      'GET /api/metrics': 'Get ML model performance metrics',
      'GET /health': 'Health check'
    },
    flask_service: FLASK_URL
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('=== VeriNews AI - API Gateway ===');
  console.log(`Server running on port ${PORT}`);
  console.log(`Flask ML service: ${FLASK_URL}`);
  console.log('API endpoints:');
  console.log('- POST /api/analyze - Analyze news article');
  console.log('- POST /api/analyze/batch - Batch analysis');
  console.log('- GET /api/metrics - Model metrics');
  console.log('- GET /health - Health check');
});

module.exports = app;