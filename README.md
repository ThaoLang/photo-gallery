#  Photo Gallery

A full-stack web application that allows users to upload photos and add comments.

**Live Demo**: [photo-gallery.vercel.app](https://photo-gallery-4m4x6q670-langthao200243gmailcoms-projects.vercel.app/)

**Demo in Youtube**: [Demo](https://www.youtube.com/watch?v=_ofCGg_9IVo/)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | Ant Design |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Image Storage | Cloudinary |
| Deployment | Vercel |


## Features

- Upload photos (max 4MB)
- Add comments to any photo
- Display all uploaded photos with comments

## Getting Started (Local Development)
### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://..."

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### 3. Setup database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server
```bash
npm run dev
```