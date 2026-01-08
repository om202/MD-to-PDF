# Deployment to GitHub Pages

This Next.js project is configured for static export and automated deployment to GitHub Pages.

## Configuration

The project is already configured with:
- ✅ `output: 'export'` in `next.config.ts` for static HTML generation
- ✅ `images.unoptimized: true` to disable Next.js image optimization
- ✅ GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment

## Setup GitHub Pages

1. **Push this repository to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit with GitHub Pages config"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in repository settings**
   - Go to your repository → Settings → Pages
   - Under "Source", select **GitHub Actions**
   - Save the changes

3. **Trigger deployment**
   - The workflow will automatically run on every push to `main`
   - Or manually trigger it from Actions tab → "Deploy to GitHub Pages" → "Run workflow"

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (generates static files in ./out)
npm run build

# Preview production build locally
npx serve@latest out
```

## Important Notes

### Limitations (GitHub Pages Static Export)
- ❌ No Server-Side Rendering (SSR)
- ❌ No API Routes
- ❌ No Incremental Static Regeneration (ISR)
- ❌ No middleware
- ❌ No Image Optimization (next/image default loader)

### Using a Custom Domain
If using a custom domain:
1. Remove or update `basePath` in `next.config.ts`
2. Add a `CNAME` file to the `public/` folder with your domain

### Using Repository Name as Base Path
If NOT using a custom domain (accessible via `username.github.io/repo-name`):
1. Add this to `next.config.ts`:
   ```typescript
   basePath: '/YOUR_REPO_NAME',
   ```

## Troubleshooting

- **404 errors**: Make sure GitHub Pages source is set to "GitHub Actions"
- **Assets not loading**: Check if you need to add `basePath` for non-custom domains
- **Build fails**: Check the Actions tab for error logs
