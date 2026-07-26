# Courtside Frontend (Nuxt.js)

![Courtside Preview](./public/github-preview.png)

## Overview

Courtside is a web platform for booking and managing sports venues.
This repository contains the frontend application built with Nuxt.js, focusing on performance, scalability, and a clean user experience.

The app integrates with a backend API to handle data such as venue listings, schedules, and transactions.

---

## Features

* Browse and search sports venues
* Booking system with schedule selection
* Payment integration using Midtrans Snap
* Real-time chat between users and admin
* Booking status updates and notifications
* Responsive UI for mobile and desktop

---

## Tech Stack

* Nuxt.js 4
* Vue 3 (Composition API)
* Tailwind CSS
* REST API integration
* Midtrans Payment Gateway

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/username/courtside-fe.git
cd courtside-fe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 4. Run the development server

```bash
npm run dev
```

### 5. Open in browser

http://localhost:3000

---

## Folder Structure

```
components/
pages/
layouts/
assets/
public/
composables/
```

---

## Backend Integration

This frontend relies on a Laravel-based backend API.
Make sure the backend service is running and accessible via the configured base URL.

---

## Author

Rizqy Akmal
https://github.com/MohammadRizqyAkmaluddin
