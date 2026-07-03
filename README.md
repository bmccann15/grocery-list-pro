# Grocery List Pro v1.0

A GitHub Pages-ready grocery list PWA that automatically sorts items by grocery-store section.

## Features

- Add one item or several comma-separated items at once
- Automatic section guessing for produce, dairy, meat, bakery, Mexican/international, household, and more
- Manual section override for any item
- Check off items while shopping
- Clear checked items or reset the full list
- Search and filter active/all/checked items
- Local browser saving
- JSON export/import backup
- PWA manifest and McCann Apps-style icons included

## GitHub Pages setup

1. Create a repository named `grocery-list-pro`.
2. Upload all files in this folder, including `.github`.
3. Commit to `main`.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, choose **GitHub Actions**.
6. The workflow should publish the app to:

`https://YOUR-USERNAME.github.io/grocery-list-pro/`

## Local development

```bash
npm ci
npm run dev
npm run build
```
