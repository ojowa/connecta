# Azure Free Tier Deployment Setup

## Required Azure Resources

### 1. Resource Group
```bash
az group create --name ojchat-rg --location eastus
```

### 2. Azure Container Registry (ACR)
**Required**: Basic tier ($5/month) or higher for Container Apps to pull images
```bash
az acr create --name ojchatacr --resource-group ojchat-rg --sku Basic --admin-enabled true
```

### 3. Azure Container Apps Environment
```bash
az containerapp env create --name ojchat-env --resource-group ojchat-rg --location eastus
```

### 4. Azure Container App (Consumption Plan - Free Tier)
```bash
az containerapp create \
  --name ojchat-backend \
  --resource-group ojchat-rg \
  --environment ojchat-env \
  --image ojchatacr.azurecr.io/ojchat-backend:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server ojchatacr.azurecr.io \
  --cpu 0.5 --memory 1Gi \
  --min-replicas 0 --max-replicas 1
```

### 5. PostgreSQL (Azure Database for PostgreSQL - Flexible Server)
Free tier: 12 months free, then ~$5/month
```bash
az postgres flexible-server create \
  --name ojchat-db \
  --resource-group ojchat-rg \
  --location eastus \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32 \
  --admin-user postgres \
  --admin-password "your-secure-password"
```

### 6. Redis (Azure Cache for Redis)
Basic C0 tier (256 MB) - not free after first month
```bash
az redis create --name ojchat-redis --resource-group ojchat-rg --location eastus --sku Basic --vm-size C0
```

### 7. Azure Static Web Apps (Admin Web)
Free tier available
```bash
az staticwebapp create \
  --name ojchat-admin \
  --resource-group ojchat-rg \
  --location eastus2 \
  --source https://github.com/yourusername/OJChat \
  --branch main \
  --app-location "/apps/admin-web" \
  --output-location ".next"
```

---

## GitHub Repository Secrets (Settings → Secrets and variables → Actions)

| Secret | Description | Example |
|--------|-------------|---------|
| `AZURE_CREDENTIALS` | JSON output from `az ad sp create-for-rbac --name "github-actions" --role contributor --scopes /subscriptions/<sub-id>/resourceGroups/ojchat-rg --sdk-auth` | `{"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}` |
| `AZURE_CONTAINER_REGISTRY` | ACR login server | `ojchatacr.azurecr.io` |
| `ACR_USERNAME` | ACR admin username | `ojchatacr` |
| `ACR_PASSWORD` | ACR admin password | `xxxxxxxxxxxx` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@ojchat-db.postgres.database.azure.com:5432/ojchat_db` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secret-jwt-key-here` |
| `REDIS_URL` | Redis connection string | `redis://ojchat-redis.redis.cache.windows.net:6380` |
| `ADMIN_JWT_SECRET` | Admin panel JWT secret | `admin-jwt-secret-different-from-above` |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | `sk_test_xxxxxxxxxxxx` |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | `pk_test_xxxxxxxxxxxx` |
| `AWS_ACCESS_KEY_ID` | AWS/S3 access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS/S3 secret key | `xxxxxxxxxxxx` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET` | S3 bucket name | `ojchat-uploads` |
| `EXPO_PUSH_TOKEN` | Expo push notification token | `xxxxxxxxxxxx` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | From Azure Static Web Apps "Manage deployment token" | `xxxxxxxxxxxx` |

---

## Free Tier Limits (Azure Container Apps)

| Resource | Free Tier Limit |
|----------|-----------------|
| vCPU | 180,000 vCPU-seconds/month |
| Memory | 360,000 GiB-seconds/month |
| Requests | 2 million requests/month |
| Bandwidth | Free egress (inbound always free) |

**With 0.5 vCPU / 1 GiB container:**
- Max ~43,200 seconds/month = ~12 hours/month if running continuously
- Scale to zero (`min-replicas: 0`) saves quota when idle
- **Not suitable for always-on services** - consider paid tier for production

---

## Alternative: Azure Web App for Containers (Not Free Tier)

The **Free (F1) tier does NOT support custom containers**. You need at least **Basic (B1) tier (~$13/month)**.

If you want Web App for Containers, use the `azure-webapp-deploy.yml` workflow and upgrade to B1.

---

## Running Migrations in Production

The workflow runs `npm run migration:run` via `az containerapp exec`. For first deploy:

```bash
az containerapp exec --name ojchat-backend --resource-group ojchat-rg --command "npm run migration:run"
```

---

## Local Testing with Docker

```bash
# Build
docker build -t ojchat-backend .

# Run (requires env vars)
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e REDIS_URL="redis://..." \
  ojchat-backend
```