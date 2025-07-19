# GitHub Actions Deployment - Setup Instructions

## 🚀 Automatic Deployment Setup

Your IBF Svelte Dashboard now has automatic deployment via GitHub Actions!

### 📍 **How It Works**

1. **Production Deployment**:
   - ✅ **Trigger**: Push to `main` branch
   - 🎯 **Deploys to**: `ibf-dashboard-production`
   - 🌐 **URL**: https://yellow-dune-0f545eb03.1.azurestaticapps.net

2. **Test Deployment**:
   - ✅ **Trigger**: Push to `ibf-svelte` branch OR Pull Request to `main`
   - 🎯 **Deploys to**: `ibf-dashboard-test`
   - 🌐 **URL**: https://black-stone-0c5505f03.2.azurestaticapps.net

### 🔧 **Required Setup Steps**

#### 1. Add GitHub Repository Secrets

Go to your repository settings and add these secrets:

**URL**: `https://github.com/rodekruis/IBF-system/settings/secrets/actions`

**Secrets to Add**:

```bash
# Secret Name: AZURE_STATIC_WEB_APPS_API_TOKEN_PRODUCTION
# Secret Value:
22f22ba6a4d3605e20103dcb4c5ab6d453c3604ae1e35a20c737de052b5b9c6501-d4813926-61a5-4d48-a5ab-ab864c0a866c00313070f5445eb03

# Secret Name: AZURE_STATIC_WEB_APPS_API_TOKEN_TEST  
# Secret Value:
79103502efb4ab0ae7be9936a29fb0fd8fd36442a4d0a9dae201c433378c829702-5fa80d82-1433-414f-b413-598517d9923c00301190c55505f03
```

#### 2. Workflow File Location

The workflow is now properly located at:
```
.github/workflows/deploy-ibf-svelte.yml
```

### 🎯 **Deployment Workflow**

```yaml
# Automatic deployment based on branches:
main branch      → ibf-dashboard-production
ibf-svelte branch → ibf-dashboard-test
Pull Requests    → ibf-dashboard-test (preview)
```

### 📋 **How to Deploy**

#### **Deploy to Test Environment**:
```bash
# Push to ibf-svelte branch
git checkout ibf-svelte
git add .
git commit -m "Update IBF dashboard"
git push origin ibf-svelte
```

#### **Deploy to Production**:
```bash
# Merge to main branch
git checkout main
git merge ibf-svelte
git push origin main
```

#### **Pull Request Preview**:
```bash
# Create PR from any branch to main
# - Automatically deploys to test environment
# - Shows preview URL in PR comments
# - Automatically cleans up when PR is closed
```

### 🔄 **Build Process**

The GitHub Actions workflow automatically:

1. ✅ **Checks out code** from the repository
2. ✅ **Sets up Node.js 18** with npm cache
3. ✅ **Installs dependencies** with `npm ci`
4. ✅ **Builds the app** with `npm run build`
5. ✅ **Deploys to Azure** Static Web Apps
6. ✅ **Reports deployment status** and URLs

### 🌍 **Environment Variables**

The build process includes:
```yaml
env:
  VITE_ESPOCRM_API_URL: https://ibf-pivot-crm.510.global/api/v1
```

### 📊 **Monitoring Deployments**

- **GitHub Actions Tab**: See build/deploy status and logs
- **Azure Portal**: Monitor Static Web App metrics and logs  
- **Pull Request Comments**: Automatic preview URLs
- **Branch Protection**: Optional - require successful deployment before merge

### 🆘 **Troubleshooting**

#### **Common Issues**:

1. **Missing Secrets**: Ensure both deployment tokens are added to GitHub secrets
2. **Build Failures**: Check the Actions tab for detailed error logs
3. **Wrong Branch**: Verify you're pushing to the correct branch (main vs ibf-svelte)
4. **Permissions**: Ensure repository has Actions enabled

#### **Manual Deployment** (if needed):
You can still use the PowerShell script for manual deployments:
```powershell
.\deploy-named-environments-fixed.ps1
```

### 🎉 **Next Steps**

1. **Add the GitHub secrets** (most important!)
2. **Test the workflow** by pushing to `ibf-svelte` branch
3. **Update EspoCRM** to use the production URL
4. **Set up branch protection rules** (optional)
5. **Configure notifications** for deployment status

### 📚 **Resources**

- [Azure Static Web Apps GitHub Actions](https://docs.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Managing GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
