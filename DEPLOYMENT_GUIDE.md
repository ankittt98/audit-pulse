# Deployment & Setup Guide - AuditPulse Platform

This guide provides clear instructions on how to run **AuditPulse** locally on a computer or deploy it to the cloud using **Vercel** (or Netlify/AWS Amplify).

---

## 1. Quick Start - Running Locally on a Laptop

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (installed automatically with Node.js)

### Local Setup Steps
1. **Extract the Project Zip**:
   Unzip the `audit-pulse.zip` file into any folder on your laptop.

2. **Open Terminal / Command Prompt**:
   Navigate into the unzipped project folder:
   ```bash
   cd audit-pulse
   ```

3. **Install Dependencies**:
   Run the following command to install all required packages:
   ```bash
   npm install
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Application in Browser**:
   Open your browser and visit:
   `http://localhost:5173`

---

## 2. Deploying to Vercel (Cloud Deployment)

**AuditPulse** is pre-configured with `vercel.json` for seamless 1-click cloud deployment on Vercel.

### Method A: Deploy via Vercel Dashboard (Recommended)

1. **Upload Project to GitHub / GitLab / Bitbucket**:
   Push the `audit-pulse` project folder to your Git provider repository.

2. **Log into Vercel**:
   Go to [vercel.com](https://vercel.com) and log in or sign up.

3. **Import Project**:
   - Click **"Add New"** → **"Project"**.
   - Select your `audit-pulse` repository.

4. **Project Configuration** (Vercel automatically detects Vite):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Deploy**:
   Click **"Deploy"**. Vercel will build and deploy the application within ~30 seconds, generating a production URL (e.g. `https://audit-pulse.vercel.app`).

---

### Method B: Deploy via Vercel CLI (Direct Command Line)

If you have Node.js installed on your laptop, you can deploy directly from your terminal without linking GitHub:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Preview Environment**:
   Inside the `audit-pulse` directory, run:
   ```bash
   vercel
   ```
   *Follow the quick interactive prompts to log in and confirm settings.*

3. **Deploy to Production**:
   To publish to your live production URL:
   ```bash
   vercel --prod
   ```

---

## 3. How to Package the Code into a ZIP File for Sharing

When sharing the codebase with team members or clients:

1. Make sure to **exclude** `node_modules` and `dist` to keep the ZIP file small (~1MB instead of 100MB+).
2. Command line ZIP command (Linux / macOS):
   ```bash
   zip -r audit-pulse.zip . -x "node_modules/*" -x "dist/*" -x ".git/*"
   ```
3. Or select all files inside the `audit-pulse` folder on Windows/macOS file explorer (except `node_modules`) and choose **Compress / Send to Zip**.

---

## 4. Environment & Build Commands Reference

| Script Command | Description |
|---|---|
| `npm run dev` | Launches local Vite development server with hot-reload |
| `npm run build` | Compiles TypeScript and creates optimized production bundle in `dist/` |
| `npm run preview` | Previews the production build locally before deployment |

---

## 5. Deployment Configuration Files

- [`vercel.json`](./vercel.json): Configured with single-page application (SPA) rewrite rules so direct URLs deep link correctly on Vercel servers.
- [`vite.config.ts`](./vite.config.ts): Bundler setup with React and Tailwind CSS v4 plugins.
