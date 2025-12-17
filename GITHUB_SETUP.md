# GitHub Repository Setup Guide

This guide will help you set up the Matcher project on GitHub.

## Initial Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `matcher` (or your preferred name)
4. Description: "A modern dating application built with React Native and SvelteKit"
5. Choose visibility: Public or Private
6. **Do NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### 2. Initialize Git Repository

```bash
cd /home/juan/Projects/matcher

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Matcher dating app"

# Add remote repository (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/matcher.git

# Rename default branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. Configure Git User (if not already done)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Repository Settings

### 1. Protect Main Branch

1. Go to repository → Settings → Branches
2. Add branch protection rule for `main`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

### 2. Set Up GitHub Secrets

For CI/CD workflows, add secrets in:
Settings → Secrets and variables → Actions

Add these secrets:
- `DATABASE_URL` - Production database connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` - Email configuration
- `SESSION_SECRET` - Session secret

### 3. Enable GitHub Actions

1. Go to Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Save changes

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch (optional)

### Feature Branches
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/documentation` - Documentation updates

### Example Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
# After PR is merged, update local main
git checkout main
git pull origin main
```

## GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Runs tests on push
- Builds the application
- Can be extended for deployment

### Customizing Deployment

Edit `.github/workflows/deploy.yml` to add your deployment steps:
- SSH deployment to VPS
- Docker registry push
- Cloud platform deployment (Render, Railway, etc.)

## Repository Structure

```
matcher/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── mobile/                     # React Native app
├── web/                        # SvelteKit backend/frontend
├── design-system/              # Shared design tokens
├── .gitignore                 # Git ignore rules
├── .gitattributes              # Git attributes
├── README.md                   # Main documentation
├── DEPLOYMENT.md              # Deployment guide
├── CONTRIBUTING.md            # Contribution guidelines
├── PRODUCTION_CHECKLIST.md    # Production checklist
├── LICENSE                    # MIT License
└── GITHUB_SETUP.md           # This file
```

## Best Practices

### Commits
- Use clear, descriptive commit messages
- Follow conventional commits format:
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation
  - `refactor:` - Code refactoring
  - `test:` - Tests
  - `chore:` - Maintenance

### Pull Requests
- Keep PRs focused and small
- Include description of changes
- Reference related issues
- Request reviews from team members

### Issues
- Use issue templates (optional)
- Label issues appropriately
- Link PRs to issues
- Close issues when resolved

## Security

### Important Notes
- **Never commit `.env` files** - They are in `.gitignore`
- **Never commit secrets** - Use GitHub Secrets
- **Review dependencies** - Keep them updated
- **Enable Dependabot** - For automatic dependency updates

### Enable Dependabot

1. Go to Settings → Code security and analysis
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"

## Next Steps

After setting up GitHub:

1. ✅ Clone repository on other machines
2. ✅ Set up CI/CD for automatic deployments
3. ✅ Configure branch protection
4. ✅ Add collaborators (if team project)
5. ✅ Set up project board for issue tracking
6. ✅ Configure webhooks for deployments

## Troubleshooting

### Authentication Issues
- Use SSH keys or Personal Access Tokens
- Configure Git credential helper

### Push Rejected
- Pull latest changes first: `git pull origin main`
- Resolve conflicts if any
- Try again: `git push origin main`

### Large Files
- Use Git LFS for large files
- Or exclude from repository

## Support

For GitHub-specific issues, refer to:
- [GitHub Documentation](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)

