# Setting Up a Custom Domain for Aventuras Lingüísticas

This guide explains how to set up a custom domain for your GitHub Pages website.

## Current URLs

- **Repository URL**: `https://github.com/Farechiga/aventuras-linguisticas` (where your code is stored)
- **GitHub Pages URL**: `https://farechiga.github.io/aventuras-linguisticas/` (default publishing URL)

## Setting Up a Custom Domain

### Step 1: Purchase a Domain

First, you need to purchase a domain from a domain registrar. Some popular options include:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare Registrar

For example, you might purchase:
- `aventuraslinguisticas.com`
- `aventuras-linguisticas.com`
- `spanish-adventures.com`

### Step 2: Configure DNS Records

After purchasing your domain, you'll need to configure DNS records at your domain registrar. There are two approaches:

#### Option A: Apex Domain (e.g., `aventuraslinguisticas.com`)

Add these A records pointing to GitHub Pages' IP addresses:
```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

#### Option B: WWW Subdomain (e.g., `www.aventuraslinguisticas.com`)

Add a CNAME record:
```
CNAME    www    farechiga.github.io.
```

For best results, configure both the apex domain and the www subdomain.

### Step 3: Configure GitHub Pages

1. Go to your GitHub repository: `https://github.com/Farechiga/aventuras-linguisticas`
2. Click on "Settings"
3. In the left sidebar, click on "Pages"
4. Under "Custom domain", enter your domain (e.g., `aventuraslinguisticas.com`)
5. Click "Save"
6. Check the "Enforce HTTPS" box (after DNS propagation completes)

### Step 4: Create a CNAME File

GitHub will automatically create a CNAME file in your repository. Alternatively, you can create it manually:

```
cd /Users/family/Aventuras-linguisticas
echo "aventuraslinguisticas.com" > public/CNAME
git add public/CNAME
git commit -m "Add CNAME file for custom domain"
git push
```

### Step 5: Wait for DNS Propagation

DNS changes can take up to 24-48 hours to propagate completely. Be patient during this process.

### Verification

To verify your DNS settings are correct:

```
dig +noall +answer aventuraslinguisticas.com
dig +noall +answer www.aventuraslinguisticas.com
```

## Troubleshooting

If you encounter the error "The custom domain `github.com/farechiga/aventuras-linguisticas` is not properly formatted":

- This indicates you're trying to use a GitHub URL as a custom domain, which is incorrect
- A custom domain must be a domain you own and have purchased from a domain registrar
- The format should be like `example.com` or `www.example.com`, not a GitHub URL

## Alternatives

If you don't want to purchase a custom domain, you can simply use the default GitHub Pages URL:
`https://farechiga.github.io/aventuras-linguisticas/`

This URL will work just fine and is completely free.

## References

- [About custom domains and GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)
- [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)