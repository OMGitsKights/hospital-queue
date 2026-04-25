# 🚢 CareFlo - Deployment Guide

## **From Development to Production**

---

## 🎯 Deployment Overview

### **Deployment Stages**

```
Development → Staging → Production
(localhost)   (test env) (live hospital)
```

This guide covers all three stages.

---

## 💻 Local Development (Already Covered)

See [Quick Start Guide](./04_QUICK_START_GUIDE.md) for local setup.

---

## 🧪 Staging Environment Setup

### **Purpose: Pre-Production Testing**

**Infrastructure:**
- Cloud VM (AWS EC2 t3.small or equivalent)
- Ubuntu 22.04 LTS
- Public IP for testing
- Domain: staging.careflo.io

---

### **Step 1: Provision Cloud Server**

**AWS EC2 Example:**
```bash
# Launch instance
Instance Type: t3.small (2 vCPU, 2 GB RAM)
OS: Ubuntu 22.04 LTS
Storage: 20 GB SSD
Security Group:
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 3000 (React dev - temporary)
  - Port 5001 (Flask - temporary)
```

**Connect via SSH:**
```bash
ssh -i your-key.pem ubuntu@<PUBLIC_IP>
```

---

### **Step 2: Install Dependencies**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3 & pip
sudo apt install -y python3 python3-pip

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Verify installations
node --version   # Should show v18.x.x
python3 --version # Should show 3.10.x
nginx -v          # Should show 1.18.x+
```

---

### **Step 3: Clone Repository**

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/hospital-queue.git
cd hospital-queue
```

---

### **Step 4: Backend Setup**

```bash
cd backend

# Install Python dependencies
pip3 install flask flask-cors werkzeug gunicorn

# Create systemd service for auto-restart
sudo nano /etc/systemd/system/careflo-backend.service
```

**Service File Content:**
```ini
[Unit]
Description=CareFlo Backend Flask App
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/hospital-queue/backend
ExecStart=/usr/local/bin/gunicorn -w 4 -b 0.0.0.0:5001 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

**Enable & Start Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable careflo-backend
sudo systemctl start careflo-backend
sudo systemctl status careflo-backend  # Should show "active (running)"
```

---

### **Step 5: Frontend Build & Deploy**

```bash
cd /home/ubuntu/hospital-queue

# Install dependencies
npm install

# Build production bundle
npm run build
# Output: build/ folder with optimized static files
```

**Configure Nginx to Serve Frontend:**
```bash
sudo nano /etc/nginx/sites-available/careflo
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name staging.careflo.io;  # Or your public IP

    # Serve React frontend
    location / {
        root /home/ubuntu/hospital-queue/build;
        try_files $uri /index.html;
    }

    # Proxy API requests to Flask backend
    location /auth/ {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /book {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /queues {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }

    location /patients {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }

    location /prescriptions {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }

    location /patient-done {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }

    location /hospital-busyness {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }

    location /my-bookings {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }

    location /reset {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/careflo /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

### **Step 6: Test Staging**

Visit: `http://staging.careflo.io` or `http://<PUBLIC_IP>`

✅ **Success Checklist:**
- [ ] Login page loads
- [ ] Can register new patient
- [ ] Can book appointment
- [ ] Doctor dashboard works
- [ ] Prescriptions can be created
- [ ] Language switching works

---

## 🔐 SSL/HTTPS Setup (Let's Encrypt)

### **Install Certbot:**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### **Obtain SSL Certificate:**
```bash
sudo certbot --nginx -d staging.careflo.io
```

**Follow prompts:**
- Email: your@email.com
- Agree to terms: Yes
- Redirect HTTP to HTTPS: Yes

**Auto-Renewal:**
```bash
sudo certbot renew --dry-run  # Test renewal
# Certbot auto-renews via systemd timer
```

**Visit:** `https://staging.careflo.io` (🔒 Secure!)

---

## 🚀 Production Deployment

### **Differences from Staging:**

| Aspect | Staging | Production |
|--------|---------|------------|
| **Domain** | staging.careflo.io | careflo.io |
| **Database** | JSON files (OK) | PostgreSQL (Recommended) |
| **Monitoring** | Optional | **Required** (Sentry, Datadog) |
| **Backups** | Nice to have | **Daily automated** |
| **Server Size** | t3.small | t3.medium+ (auto-scaling) |
| **Debug Mode** | ON | **OFF** (Flask debug=False) |

---

### **Production-Specific Steps**

#### **1. Database Migration (PostgreSQL)**

**Install PostgreSQL:**
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Create Database:**
```bash
sudo -u postgres psql
CREATE DATABASE careflo_prod;
CREATE USER careflo_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE careflo_prod TO careflo_user;
\q
```

**Update Backend (app.py):**

Replace JSON file logic with SQLAlchemy ORM:

```python
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://careflo_user:password@localhost/careflo_prod'
db = SQLAlchemy(app)

# Define models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(255))
    role = db.Column(db.String(20))
    # ...

# Migrate existing JSON data to PostgreSQL (one-time script)
```

---

#### **2. Environment Variables (Secrets)**

**Never hardcode credentials!**

Create `.env` file:
```bash
nano /home/ubuntu/hospital-queue/backend/.env
```

**Content:**
```env
DATABASE_URL=postgresql://careflo_user:secure_password@localhost/careflo_prod
SECRET_KEY=your-256-bit-secret-key-here
FLASK_ENV=production
FLASK_DEBUG=False
```

**Load in app.py:**
```python
from dotenv import load_dotenv
load_dotenv()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
```

**Install python-dotenv:**
```bash
pip3 install python-dotenv
```

---

#### **3. Monitoring Setup**

**Error Tracking (Sentry):**
```bash
pip3 install sentry-sdk[flask]
```

**Add to app.py:**
```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn@sentry.io/project-id",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)
```

**Server Monitoring (optional - Datadog/New Relic):**
```bash
# Install Datadog agent
DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=<YOUR_API_KEY> bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

---

#### **4. Automated Backups**

**Database Backup Script:**
```bash
nano /home/ubuntu/backup.sh
```

**Content:**
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U careflo_user careflo_prod > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Backup JSON files (if still using)
cp /home/ubuntu/hospital-queue/backend/users.json $BACKUP_DIR/users_$TIMESTAMP.json
cp /home/ubuntu/hospital-queue/backend/prescriptions.json $BACKUP_DIR/prescriptions_$TIMESTAMP.json

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_backup_$TIMESTAMP.sql s3://careflo-backups/
```

**Make Executable:**
```bash
chmod +x /home/ubuntu/backup.sh
```

**Schedule with Cron (Daily 2 AM):**
```bash
crontab -e
```

**Add line:**
```
0 2 * * * /home/ubuntu/backup.sh
```

---

#### **5. Load Balancing (High Traffic)**

**For 1000+ concurrent users:**

Use AWS Application Load Balancer (ALB) with auto-scaling:

```
Internet
   ↓
ALB (ports 80/443)
   ↓
┌──────────┬──────────┬──────────┐
│ EC2 #1   │ EC2 #2   │ EC2 #3   │
│ Flask    │ Flask    │ Flask    │
└──────────┴──────────┴──────────┘
   ↓
RDS PostgreSQL (Multi-AZ)
```

**AWS Auto Scaling Group:**
- Min instances: 2
- Max instances: 10
- Scaling trigger: CPU > 70%

---

## 🐳 Docker Deployment (Alternative)

### **Advantages:**
- ✅ Consistent environments
- ✅ Easy rollbacks
- ✅ Horizontal scaling

### **Dockerfile (Backend):**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
```

### **Dockerfile (Frontend):**
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### **docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/careflo
    depends_on:
      - db

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: careflo
      POSTGRES_USER: careflo_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 📊 Performance Optimization

### **1. Frontend Optimization**

**Code Splitting (React):**
```javascript
// Lazy load components
const DoctorView = React.lazy(() => import('./DoctorView'));

<Suspense fallback={<div>Loading...</div>}>
  <DoctorView />
</Suspense>
```

**Build Optimization:**
```bash
# Already done by `npm run build`
# Minification, tree-shaking, code splitting
```

---

### **2. Backend Optimization**

**Gunicorn Workers:**
```bash
# Formula: (2 × CPU cores) + 1
# For 4-core server: 9 workers
gunicorn -w 9 -b 0.0.0.0:5001 app:app
```

**Redis Caching (Future):**
```bash
sudo apt install -y redis-server
pip3 install redis
```

**Cache hospital busyness data:**
```python
import redis
r = redis.Redis(host='localhost', port=6379, db=0)

@app.route("/hospital-busyness", methods=["GET"])
def get_hospital_busyness():
    cached = r.get("hospital_busyness")
    if cached:
        return jsonify(json.loads(cached)), 200
    
    # Calculate fresh data
    data = calculate_busyness()
    r.setex("hospital_busyness", 300, json.dumps(data))  # 5-min cache
    return jsonify(data), 200
```

---

## 🔒 Security Hardening

### **1. Firewall (UFW):**
```bash
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw enable
```

### **2. Change Default Passwords:**
```bash
# Delete default users or change passwords
# In production, disable default admin/doctor/patient accounts
```

### **3. Rate Limiting (Nginx):**
```nginx
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

location /auth/login {
    limit_req zone=login burst=3;
    proxy_pass http://localhost:5001;
}
```

### **4. CORS Restrictions:**
```python
# In production, restrict CORS to your domain only
CORS(app, origins=["https://careflo.io", "https://www.careflo.io"])
```

---

## 🛠️ Maintenance

### **Daily Tasks:**
- ✅ Check server logs: `sudo journalctl -u careflo-backend -f`
- ✅ Monitor error rates (Sentry dashboard)
- ✅ Review backup success

### **Weekly Tasks:**
- ✅ Update dependencies: `sudo apt update && sudo apt upgrade`
- ✅ Review disk usage: `df -h`
- ✅ Check SSL expiry: `sudo certbot certificates`

### **Monthly Tasks:**
- ✅ Security patches
- ✅ Database vacuum (PostgreSQL): `VACUUM ANALYZE;`
- ✅ Review analytics (user growth, error trends)

---

## 🚨 Rollback Procedure

### **If Production Breaks:**

**Step 1: Identify Issue**
```bash
sudo journalctl -u careflo-backend --since "10 minutes ago"
```

**Step 2: Revert Code**
```bash
cd /home/ubuntu/hospital-queue
git log --oneline -5  # Find last good commit
git checkout <LAST_GOOD_COMMIT>
```

**Step 3: Rebuild & Restart**
```bash
npm run build
sudo systemctl restart careflo-backend
sudo systemctl restart nginx
```

**Step 4: Restore Database (if needed)**
```bash
psql -U careflo_user careflo_prod < /home/ubuntu/backups/db_backup_20260208.sql
```

---

## 📈 Scaling Checklist

**When You Reach 100 Hospitals:**
- [ ] Migrate to PostgreSQL
- [ ] Add Redis caching
- [ ] Set up load balancer
- [ ] Auto-scaling group (min 2 instances)
- [ ] Database read replicas

**When You Reach 500 Hospitals:**
- [ ] Multi-region deployment (Mumbai + Bangalore regions)
- [ ] CDN for static assets (CloudFront)
- [ ] Database sharding by geography
- [ ] Dedicated monitoring team

---

## ✅ Production Launch Checklist

**Pre-Launch:**
- [ ] SSL certificate installed & auto-renewal tested
- [ ] Database backups automated (daily)
- [ ] Monitoring dashboards set up (Sentry, Datadog)
- [ ] Load testing completed (1000 concurrent users)
- [ ] Security audit completed
- [ ] DNS configured (A record pointing to server IP)
- [ ] Firewall rules active
- [ ] Default passwords changed/disabled
- [ ] Error logging tested
- [ ] Rollback procedure documented & tested

**Launch Day:**
- [ ] Final smoke test (all user flows)
- [ ] Customer support email active
- [ ] Incident response plan ready
- [ ] Team on standby for 24 hours

**Post-Launch:**
- [ ] Monitor error rates hourly (Day 1)
- [ ] Daily check-ins (Week 1)
- [ ] Collect user feedback
- [ ] Address critical bugs within 4 hours

---

**CareFlo is ready for the real world! 🚀 Deploy with confidence.**
