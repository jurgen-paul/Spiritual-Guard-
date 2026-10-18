# Security Policy & Architecture Documentation

## Spiritual Guard AI Core

This document outlines the security architecture, data handling practices, authentication safeguards, and vulnerability disclosure policies for **Spiritual Guard AI Core**.

---

### 1. Google Workspace Data Protection & Privacy

Spiritual Guard AI Core integrates with Google Tasks to enable users to synchronize spiritual routines and daily vigilance habits.

- **Least Privilege Principle (Scope Minimization)**:
  - The application requests solely `https://www.googleapis.com/auth/tasks` to create, read, update, and manage user tasks and task lists.
  - The application does not request access to Google Drive, Gmail, Google Contacts, Google Calendar, or other unrelated Workspace scopes.
- **Client-Side Token Authentication**:
  - OAuth tokens are obtained exclusively on the client side via Firebase Authentication popup flows with the user's explicit consent.
  - **In-Memory Token Caching**: Access tokens are held exclusively in memory (`cachedAccessToken`). Under no circumstances are tokens written to `localStorage`, `sessionStorage`, or IndexedDB.
  - When the user signs out or the session terminates, the cached token is immediately purged from memory.
- **Mandatory User Confirmation for Destructive Operations**:
  - In accordance with Google Workspace API security guidelines, any mutating or destructive action (deleting a task, clearing completed tasks, or deleting a list) prompts an explicit user confirmation dialog with detailed context before the API request is dispatched.
  - Silent deletions or bulk operations without confirmation are strictly prevented.

---

### 2. Server-Side Key Isolation & Gemini API Proxy

- **Zero Client-Side API Keys**:
  - The Gemini API key (`GEMINI_API_KEY`) is stored securely as an environment variable and injected exclusively into the server-side runtime (`server.ts`).
  - No client-facing bundle contains API keys or Google Cloud secret credentials.
- **Server-Side Reverse Proxy**:
  - Client queries for spiritual discernment or routine generation route through `/api/ai/guidance`.
  - Input validation and rate-limiting safeguards protect against malicious prompt injection or volumetric abuse.

---

### 3. Google API Services User Data Policy Compliance

Spiritual Guard AI Core adheres strictly to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements:

1. **User Control**: End users can connect or disconnect their Google Tasks at any time with one click.
2. **No Data Brokerage**: Personal task data, prayer notes, and spiritual assessments are never sold, rented, or transferred to third-party data brokers or advertisers.
3. **No Model Training on Private Data**: User tasks and devotional notes are never utilized to train generalized AI models.

---

### 4. ProGuard & Code Obfuscation Safeguards

When compiled for Android or native Progressive Web App packaging, `proguard-rules.pro` enforces:
- Obfuscation of internal application architecture.
- Elimination of unneeded debugging hooks while retaining line numbers for crash diagnostics.
- Protection of cryptography providers and OAuth callbacks against tampering.

---

### 5. Reporting a Vulnerability

If you discover a security vulnerability within Spiritual Guard AI Core, please notify the security team:

- **Security Contact**: `oistarsentertainment@gmail.com`
- **Response Time**: Initial assessment within 24–48 hours.
- Please provide a detailed description of the vulnerability, reproduction steps, and potential impact. We practice responsible coordinated disclosure.
