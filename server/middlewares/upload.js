import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS = path.join(__dirname, '..', 'uploads')

import fs from 'fs'
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true })

const ALLOWED = /jpeg|jpg|png|gif|webp/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
  },
})

function fileFilter(_req, file, cb) {
  if (ALLOWED.test(path.extname(file.originalname).toLowerCase())) return cb(null, true)
  cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'))
}

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })

// Single cover image: field name 'cover'
export const uploadCover = upload.single('cover')

// Multiple gallery images: field name 'gallery', up to 8
export const uploadGallery = upload.array('gallery', 8)

// Static file serving middleware (mount this in server.js)
import express from 'express'
export const serveUploads = express.static(UPLOADS)