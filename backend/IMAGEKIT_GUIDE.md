# ImageKit Integration Guide

## Setup

### 1. Get ImageKit Credentials

1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Get your credentials from the dashboard:
   - Public Key
   - Private Key
   - URL Endpoint

### 2. Configure Environment Variables

Add to your `.env` file:

```env
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

## API Endpoints

### Upload Image

**POST** `/api/images/upload`

Upload any image to ImageKit.

```json
{
  "file": "base64_string_or_buffer",
  "fileName": "ghost-image.jpg",
  "folder": "/ghosts",
  "tags": ["ghost", "paranormal"]
}
```

### Upload Ghost Image

**POST** `/api/images/upload/ghost`

Upload a ghost-specific image with metadata.

```json
{
  "file": "base64_string_or_buffer",
  "fileName": "banshee.jpg",
  "ghostId": "uuid-here",
  "tags": ["banshee", "irish"]
}
```

### Get Authentication Parameters

**GET** `/api/images/auth`

Get client-side upload authentication parameters.

### Get Image Details

**GET** `/api/images/:fileId`

Retrieve details about a specific image.

### Delete Image

**DELETE** `/api/images/:fileId`

Delete an image from ImageKit.

### List Images

**GET** `/api/images/list/:folder?tags=ghost,paranormal`

List images in a folder with optional tag filtering.

## Usage Examples

### Server-Side Upload

```typescript
import { imagekitService } from './services';

// Upload from buffer
const buffer = fs.readFileSync('ghost.jpg');
const result = await imagekitService.uploadGhostImage(
  buffer,
  'ghost-123',
  'ghost.jpg',
  ['scary', 'haunted']
);

// Get transformed URL
const url = imagekitService.getImageUrl(result.filePath, {
  width: 400,
  height: 400,
  quality: 80,
  format: 'webp',
});
```

### Client-Side Upload

```typescript
// Get auth params from backend
const authResponse = await fetch('/api/images/auth');
const { signature, expire, token } = await authResponse.json();

// Upload using ImageKit SDK
const imagekit = new ImageKit({
  publicKey: 'your_public_key',
  urlEndpoint: 'your_url_endpoint',
});

const result = await imagekit.upload({
  file: fileInput.files[0],
  fileName: 'ghost.jpg',
  signature,
  expire,
  token,
});
```

## Image Transformations

ImageKit supports real-time image transformations via URL:

```typescript
// Resize and optimize
const url = imagekitService.getImageUrl('/ghosts/banshee.jpg', {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp',
  crop: 'maintain_ratio',
});

// Result: optimized WebP image at 800x600
```

## Configuration

Default settings in `backend/src/config/imagekit.ts`:

- Max file size: 10MB
- Allowed formats: jpg, jpeg, png, webp, gif
- Default folder: `/ghosts`
- Default quality: 80%

## Best Practices

1. **Always validate files** before upload using `imagekitService.validateFile()`
2. **Use tags** for better organization and searchability
3. **Store fileId** in your database for easy reference
4. **Use transformations** to serve optimized images
5. **Implement proper error handling** for upload failures
6. **Use client-side upload** for large files to reduce server load

## Security

- All endpoints require authentication via `authMiddleware`
- Private key is never exposed to clients
- Client-side uploads use time-limited signatures
- File validation prevents malicious uploads
