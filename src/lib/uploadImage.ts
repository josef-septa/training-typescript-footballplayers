import fs from 'fs';
import path from 'path';

export async function processImage(imageData: string | undefined | null): Promise<string | null> {
  if (!imageData) return null;

  // If it's already an uploaded file URL (e.g., /uploads/123.png)
  if (imageData.startsWith('/uploads/')) {
    return imageData;
  }

  // If it's a base64 image
  const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Determine extension
    let extension = 'png';
    if (mimeType === 'image/jpeg') extension = 'jpg';
    else if (mimeType === 'image/webp') extension = 'webp';
    else if (mimeType === 'image/gif') extension = 'gif';
    else if (mimeType === 'image/svg+xml') extension = 'svg';
    
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filePath = path.join(uploadDir, fileName);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  }

  // Fallback (e.g., plain URL or invalid data)
  return imageData;
}

export async function deleteImage(imageUrl: string | null | undefined) {
  if (!imageUrl) return;
  
  if (imageUrl.startsWith('/uploads/')) {
    const fileName = imageUrl.replace('/uploads/', '');
    const filePath = path.join(process.cwd(), 'public/uploads', fileName);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (e) {
      console.error('Failed to delete image', e);
    }
  }
}
