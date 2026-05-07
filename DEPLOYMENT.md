# VeriNews AI - Deployment Guide

This guide covers various deployment options for VeriNews AI, from local development to production environments.

## 🚀 Quick Deployment Options

### 1. Local Development (Recommended for Testing)

```bash
# Automated setup
./setup.sh  # Linux/macOS
# or
setup.bat   # Windows

# Manual setup
cd ml-model
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python setup.py
python train_model.py
python app.py &

cd ../backend
npm install
npm run dev &

cd ..
npm install
npm run dev
```

### 2. Docker Compose (Recommended for Production)

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Individual Docker Containers

```bash
# Build ML API
cd ml-model
docker build -t verinews-ml .
docker run -p 5000:5000 verinews-ml

# Build API Gateway
cd ../backend
docker build -t verinews-api .
docker run -p 3001:3001 -e FLASK_URL=http://host.docker.internal:5000 verinews-api
```

## 🌐 Production Deployment

### Prerequisites

- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **Docker** (optional but recommended)
- **Reverse proxy** (nginx/Apache) for production
- **SSL certificate** for HTTPS

### Environment Setup

#### ML API (.env in ml-model/)
```bash
FLASK_ENV=production
PORT=5000
WORKERS=4
TIMEOUT=120
```

#### API Gateway (.env in backend/)
```bash
NODE_ENV=production
PORT=3001
FLASK_URL=http://localhost:5000
FRONTEND_URL=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 1. Cloud Platform Deployment

#### Heroku

**ML API:**
```bash
cd ml-model
heroku create verinews-ml-api
heroku config:set FLASK_ENV=production
git subtree push --prefix=ml-model heroku main
```

**API Gateway:**
```bash
cd backend
heroku create verinews-api-gateway
heroku config:set NODE_ENV=production
heroku config:set FLASK_URL=https://verinews-ml-api.herokuapp.com
git subtree push --prefix=backend heroku main
```

#### AWS EC2

```bash
# Launch EC2 instance (Ubuntu 20.04+)
sudo apt update
sudo apt install -y python3 python3-pip nodejs npm docker.io docker-compose

# Clone repository
git clone <your-repo>
cd verinews-ai

# Run setup
./setup.sh

# Start services with PM2
npm install -g pm2
cd ml-model
pm2 start "python app.py" --name ml-api
cd ../backend
pm2 start server.js --name api-gateway
pm2 startup
pm2 save
```

#### Google Cloud Platform

```bash
# Using Cloud Run
gcloud run deploy verinews-ml --source ./ml-model --port 5000
gcloud run deploy verinews-api --source ./backend --port 3001
```

#### Azure Container Instances

```bash
# Build and push images
docker build -t verinews-ml ./ml-model
docker build -t verinews-api ./backend

# Deploy to Azure
az container create --resource-group myResourceGroup \
  --name verinews-ml --image verinews-ml \
  --ports 5000 --dns-name-label verinews-ml

az container create --resource-group myResourceGroup \
  --name verinews-api --image verinews-api \
  --ports 3001 --dns-name-label verinews-api \
  --environment-variables FLASK_URL=http://verinews-ml.region.azurecontainer.io:5000
```

### 2. VPS/Dedicated Server

#### Using Docker Compose

```bash
# Clone repository
git clone <your-repo>
cd verinews-ai

# Configure environment
cp ml-model/.env.example ml-model/.env
cp backend/.env.example backend/.env
# Edit .env files with your settings

# Start services
docker-compose up -d

# Setup reverse proxy (nginx)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/verinews
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API Gateway
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # ML API (direct access)
    location /ml/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start ML API
cd ml-model
source venv/bin/activate
pm2 start "python app.py" --name verinews-ml

# Start API Gateway
cd ../backend
pm2 start server.js --name verinews-api

# Start frontend (build first)
cd ..
npm run build
pm2 serve dist 3000 --name verinews-frontend

# Configure PM2 startup
pm2 startup
pm2 save
```

### 3. Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verinews-ml
spec:
  replicas: 3
  selector:
    matchLabels:
      app: verinews-ml
  template:
    metadata:
      labels:
        app: verinews-ml
    spec:
      containers:
      - name: ml-api
        image: verinews-ml:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: verinews-ml-service
spec:
  selector:
    app: verinews-ml
  ports:
  - port: 5000
    targetPort: 5000
  type: LoadBalancer
```

```bash
kubectl apply -f k8s-deployment.yaml
```

## 🔧 Configuration

### Environment Variables

#### ML API
- `FLASK_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `WORKERS`: Gunicorn workers (default: 4)
- `TIMEOUT`: Request timeout (default: 120s)

#### API Gateway
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)
- `FLASK_URL`: ML API URL
- `FRONTEND_URL`: Frontend URL for CORS
- `RATE_LIMIT_WINDOW_MS`: Rate limit window
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window

### SSL/TLS Configuration

For production, always use HTTPS:

```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Database Configuration (Optional)

For storing analysis history and user data:

```bash
# PostgreSQL setup
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb verinews
sudo -u postgres createuser verinews_user

# Add to environment
DATABASE_URL=postgresql://verinews_user:password@localhost/verinews
```

## 📊 Monitoring & Logging

### Health Checks

All services provide health check endpoints:
- ML API: `GET /health`
- API Gateway: `GET /health`
- Frontend: Built-in Vite health checks

### Logging

#### Application Logs
```bash
# PM2 logs
pm2 logs verinews-ml
pm2 logs verinews-api

# Docker logs
docker-compose logs -f ml-api
docker-compose logs -f api-gateway
```

#### System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor resources
htop
docker stats
```

### Performance Monitoring

#### Prometheus + Grafana
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 🔒 Security Considerations

### API Security
- Enable CORS with specific origins
- Implement rate limiting
- Use HTTPS in production
- Validate all inputs
- Sanitize error messages

### Infrastructure Security
- Keep systems updated
- Use firewalls (ufw/iptables)
- Implement fail2ban for SSH protection
- Regular security audits
- Monitor logs for suspicious activity

### Data Privacy
- Don't log sensitive user data
- Implement data retention policies
- Use secure session management
- Comply with GDPR/privacy regulations

## 🚨 Troubleshooting

### Common Issues

#### Model Loading Errors
```bash
# Check if model files exist
ls -la ml-model/*.pkl

# Retrain model if needed
cd ml-model
python train_model.py
```

#### Port Conflicts
```bash
# Check what's using ports
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3001

# Kill processes if needed
sudo kill -9 <PID>
```

#### Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Reduce workers if needed
export WORKERS=2
```

#### CORS Errors
```bash
# Check CORS configuration
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:5000/predict
```

### Performance Optimization

#### ML API
- Use gunicorn with multiple workers
- Implement model caching
- Optimize TF-IDF vectorization
- Use connection pooling

#### API Gateway
- Enable compression
- Implement caching headers
- Use clustering for multiple cores
- Optimize JSON parsing

#### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize bundle size

## 📈 Scaling

### Horizontal Scaling
- Load balancer (nginx/HAProxy)
- Multiple API instances
- Database clustering
- CDN for static content

### Vertical Scaling
- Increase server resources
- Optimize memory usage
- Use faster storage (SSD)
- Upgrade network bandwidth

### Auto-scaling
- Kubernetes HPA
- AWS Auto Scaling Groups
- Docker Swarm scaling
- Cloud provider auto-scaling

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy VeriNews AI

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Build and test
      run: |
        ./setup.sh
        cd ml-model && python test_api.py
    
    - name: Deploy to production
      run: |
        # Your deployment commands here
```

This deployment guide covers most common scenarios. Choose the option that best fits your infrastructure and requirements.