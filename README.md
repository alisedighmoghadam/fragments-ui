<!-- JavaScript,React,Docker,nginx,OAuth -->

# Fragments UI

A Next.js web client for the [Fragments API](https://github.com/alisedighmoghadam/fragments). Users sign in with Amazon Cognito, then create, view, edit, delete and convert text and image fragments.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Amazon Cognito](https://img.shields.io/badge/Auth-Amazon_Cognito-DD344C?logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

## Features

- **Sign in with Cognito** – OAuth 2.0 authorization-code flow through the Cognito Hosted UI using `oidc-client-ts`; the ID token is sent as a Bearer token on every API call.
- **Create fragments** – type text and pick a content type (plain text, Markdown, HTML, CSV, JSON, YAML) or upload an image (PNG, JPEG, WebP, GIF, AVIF).
- **Browse** – a feed of fragment cards showing type, size and created/updated dates.
- **Edit and delete** – open a card to update or remove it; editing is limited to fragments you own.
- **Convert and download** – choose a target format and download the converted file from the API.

## Tech stack

Next.js 15 (static export) · React 19 · Tailwind CSS 4 · oidc-client-ts · Docker (Node build → Nginx)

## Getting started

### Requirements

- Node.js 18+
- A running [Fragments API](https://github.com/alisedighmoghadam/fragments)
- An Amazon Cognito user pool with an app client and Hosted UI

### Configure

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AWS_COGNITO_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:3000
```

### Run

```bash
npm install
npm run dev        # http://localhost:3000 (Turbopack)
```

### Docker

The multi-stage Dockerfile builds a static export and serves it with Nginx:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api.example.com \
  --build-arg NEXT_PUBLIC_AWS_COGNITO_POOL_ID=... \
  --build-arg NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=... \
  --build-arg NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL=https://your-ui.example.com \
  -t fragments-ui .
docker run -p 80:80 fragments-ui
```

## Project structure

```
src/app/
├── page.js                   # Main page: auth, create/edit form, fragment feed
├── auth.js                   # Cognito / OIDC sign-in helpers
├── api.js                    # Fragments API client
└── components/fragmentCard.js
```

Built for DPS955 (Cloud Computing for Programmers) at Seneca Polytechnic, Summer 2025.
