# Publishing to GitHub

The project is named **local-docs** on npm and **Local Docs** in the UI. The recommended GitHub repository name is `local-docs`.

## One-time setup

1. Install [GitHub CLI](https://cli.github.com/) (already installed if you used winget).
2. Authenticate:

   ```bash
   gh auth login
   ```

3. From the project root, create the remote repository and push:

   ```bash
   gh repo create local-docs --public --source=. --remote=origin --description "Local-first rich text document editor with DOCX and PDF export" --push
   ```

If the repository already exists on GitHub, add the remote and push instead:

```bash
git remote add origin https://github.com/gabecodez/local-docs.git
git branch -M main
git push -u origin main
```

## After the first push

Update `package.json` `repository` field if needed:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/gabecodez/local-docs.git"
}
```

Replace `gabecodez` with your GitHub username if different.
