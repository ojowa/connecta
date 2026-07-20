# Deployment Guide

## Connecta — Production Deployment Procedures

**Version:** 1.0.0
**Date:** July 2026

---

## 1. Prerequisites

### 1.1 Accounts & Access

| Service | Account | Purpose |
|---|---|---|
| AWS / Azure | Root + IAM users | Cloud infrastructure |
| GitHub | Organization repo | Source code |
| Docker Hub / GHCR | Organization | Container registry |
| Cloudflare | Account | CDN + DNS |
| Sentry | Organization | Error tracking |
| PagerDuty | Account | Alerting |
| Paystack | Business account | Payments |
| Firebase | Project | Push notifications |

### 1.2 Domain & DNS

| Record | Type | Value | TTL |
|---|---|---|---|
| `connecta.app` | A/AAAA | Load balancer IP | 300 |
| `api.connecta.app` | CNAME | LB alias | 300 |
| `cdn.connecta.app` | CNAME | Cloudflare | 300 |
| `admin.connecta.app` | CNAME | Vercel/Netlify | 300 |
| `turn.connecta.app` | A | TURN server IP | 300 |

---

## 2. Infrastructure Setup

### 2.1 AWS/EKS Setup

```bash
# Create EKS cluster
eksctl create cluster \
  --name connecta-prod \
  --region af-south-1 \
  --nodegroup-name connecta-nodes \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --name connecta-prod --region af-south-1

# Install NGINX Ingress
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace connecta --create-namespace

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace connecta \
  --set installCRDs=true
```

### 2.2 Database Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier connecta-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15 \
  --master-username connecta \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --backup-retention-period 30 \
  --multi-az \
  --region af-south-1

# Create read replica
aws rds create-db-instance-read-replica \
  --db-instance-identifier connecta-db-replica \
  --source-db-instance-identifier connecta-db \
  --region af-south-1
```

### 2.3 Redis Setup

```bash
# Create ElastiCache Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id connecta-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --region af-south-1
```

---

## 3. Kubernetes Deployment

### 3.1 Secrets Management

```bash
# Create secrets
kubectl create secret generic db-secret \
  --from-literal=url='postgresql://connecta:<password>@<rds-endpoint>:5432/connecta_db' \
  -n connecta

kubectl create secret generic redis-secret \
  --from-literal=url='redis://<elasticache-endpoint>:6379' \
  -n connecta

kubectl create secret generic jwt-secret \
  --from-literal=access-token='<random-64-char>' \
  --from-literal=refresh-token='<random-64-char>' \
  -n connecta

kubectl create secret generic nats-secret \
  --from-literal=url='nats://nats:4222' \
  -n connecta
```

### 3.2 Deploy All Services

```bash
# Apply all manifests
kubectl apply -f k8s/ -n connecta

# Verify deployments
kubectl get deployments -n connecta
kubectl get pods -n connecta

# Check logs
kubectl logs -f deployment/api-gateway -n connecta
```

### 3.3 Blue-Green Deployment

```yaml
# k8s/api-gateway-deployment-blue.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway-blue
  namespace: connecta
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
      version: blue
  template:
    metadata:
      labels:
        app: api-gateway
        version: blue
    spec:
      containers:
        - name: api-gateway
          image: connecta/api-gateway:v2.0.0
---
# Switch traffic
kubectl patch service api-gateway -p '{"spec":{"selector":{"version":"blue"}}}'
```

---

## 4. SSL/TLS Setup

```yaml
# k8s/cluster-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@connecta.app
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: connecta-ingress
  namespace: connecta
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
spec:
  tls:
    - hosts:
        - api.connecta.app
        - admin.connecta.app
      secretName: connecta-tls
  rules:
    - host: api.connecta.app
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 3000
    - host: admin.connecta.app
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: admin-panel
                port:
                  number: 3000
```

---

## 5. TURN Server Setup

```bash
# Install coturn on Ubuntu
sudo apt-get install coturn

# Configure
sudo tee /etc/turnserver.conf << EOF
listening-port=3478
tls-listening-port=5349
realm=connecta.app
lt-cred-mech
user=connecta:TURN_SECRET
cert=/etc/ssl/certs/turn.pem
pkey=/etc/ssl/private/turn.key
relay-ip=PUBLIC_IP
external-ip=PUBLIC_IP/PRIVATE_IP
no-multicast-peers
no-cli
total-quota=100
stale-nonce=600
EOF

sudo systemctl enable coturn
sudo systemctl start coturn
```

---

## 6. Post-Deployment Verification

### 6.1 Health Checks

```bash
# Check all services
kubectl get pods -n connecta -o wide

# Test API
curl -s https://api.connecta.app/health | jq .

# Test WebSocket
wscat -c wss://api.connecta.app/socket.io/

# Test Admin
curl -s https://admin.connecta.app | head -5
```

### 6.2 Smoke Tests

```bash
# Run smoke tests against production
npm run test:smoke -- --env=production
```

---

## 7. Rollback Procedure

```bash
# Rollback to previous version
kubectl rollout undo deployment/api-gateway -n connecta

# Rollback to specific revision
kubectl rollout undo deployment/api-gateway --to-revision=5 -n connecta

# Check rollout history
kubectl rollout history deployment/api-gateway -n connecta
```

---

## 8. Mobile App Store Submission

### 8.1 iOS (App Store Connect)

1. Build with EAS: `eas build --platform ios --profile production`
2. Upload to App Store Connect via EAS
3. Submit for review with:
   - App description
   - Screenshots (6.7", 6.5", 5.5" devices)
   - Privacy policy URL
   - Support URL
   - App review notes

### 8.2 Android (Google Play Console)

1. Build with EAS: `eas build --platform android --profile production`
2. Upload AAB to Google Play Console
3. Submit for review with:
   - Store listing
   - Screenshots (phone, tablet)
   - Content rating questionnaire
   - Data safety section
   - Privacy policy URL

---

*This document is part of the Connecta Software Design Document (SDD) package.*
