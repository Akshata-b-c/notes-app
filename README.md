# Cloud-Based Note-Taking Application

## Project Overview

A cloud-based note-taking web application built with Next.js, React, TypeScript, and Firebase. Users can register, sign in, create notes, edit notes, delete notes, search notes, organize them using tags, and format content with Markdown. Notes are stored in Cloud Firestore, and users can share notes through read-only links that expire after 24 hours.

## Features

- Email and password registration and login
- Google sign-in
- Create new notes
- Edit existing notes
- Delete notes
- Search notes
- Organize notes using tags
- Write and preview Markdown content
- Share notes through read-only links
- Shared links expire after 24 hours
- User-specific note access
- Cloud storage using Cloud Firestore

## Technologies Used

- Next.js
- React
- TypeScript
- Firebase Authentication
- Cloud Firestore
- React Markdown
- CSS
- Vercel

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Akshata-b-c/notes-app.git
   ```

2. Open the project directory:

   ```bash
   cd notes-app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env.local` file in the project root and add your Firebase configuration values:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

5. Enable Email/Password and Google sign-in in Firebase Authentication, configure Cloud Firestore, and apply appropriate Firestore security rules.

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000` in your browser.

## Live Demo

Add your deployed Vercel website URL here:


notes-app-teal-chi.vercel.app


## GitHub Repository

https://github.com/Akshata-b-c/notes-app

## Author

Akshata
