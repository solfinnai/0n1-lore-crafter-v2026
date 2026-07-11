# Deployment Guide for 0N1 Lore Crafter

## Required Environment Variables

When deploying to Vercel, you need to add these environment variables:

### Required Variables:

1. **OPENAI_API_KEY**
   - Get from: https://platform.openai.com/api-keys
   - Required for: GPT-4 and GPT-3.5 models
   - Example: `sk-proj-abc123...`

2. **TOGETHER_API_KEY**
   - Get from: https://api.together.xyz/
   - Required for: Llama models (uncensored alternatives)
   - Example: `abc123def456...`

3. **OPENSEA_API_KEY**
   - Get from: https://docs.opensea.io/reference/api-keys
   - Required for: Fetching NFT data
   - Example: `abc123...`

### Optional Variables (for Supabase features):

4. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://your-project.supabase.co`

5. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Example: `eyJ...`

6. **SUPABASE_SERVICE_ROLE_KEY**
   - Your Supabase service role key
   - Example: `eyJ...`

## Deployment Steps

### Via Vercel Dashboard:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `v1.4` branch
4. Add environment variables (see above)
5. Click "Deploy"

### Via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# In your project directory
vercel

# Follow prompts and add env variables when asked
```

## Post-Deployment

1. Your app will be available at: `https://your-project.vercel.app`
2. Add custom domain (optional): Project Settings → Domains
3. Monitor usage: Analytics tab
4. Set up webhooks for auto-deploy on push (automatic with GitHub integration)

## Troubleshooting

- If NFTs don't load: Check OPENSEA_API_KEY
- If AI chat fails: Check OPENAI_API_KEY or TOGETHER_API_KEY
- If using extreme personalities: Llama models (TOGETHER_API_KEY) recommended # Deploy: AI chat fix Sun Jun 29 02:01:56 PDT 2025
