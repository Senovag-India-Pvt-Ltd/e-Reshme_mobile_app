import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export interface SavedImageMeta {
  fileName: string;
  path: string;
  createdAt: number;
}

const IMAGES_KEY = 'saved_location_images_v1';

async function getMetaList(): Promise<SavedImageMeta[]> {
  const res = await Preferences.get({ key: IMAGES_KEY });
  if (!res.value) return [];
  try {
    return JSON.parse(res.value) as SavedImageMeta[];
  } catch {
    return [];
  }
}

async function setMetaList(list: SavedImageMeta[]) {
  await Preferences.set({ key: IMAGES_KEY, value: JSON.stringify(list) });
}

export async function saveImageWithLocation(): Promise<SavedImageMeta | null> {
  try {
    // Check GPS first
    let pos;
    try {
      pos = await Geolocation.getCurrentPosition();
    } catch (gpsError: any) {
      console.error('GPS Error:', gpsError);
      const errorMessage = gpsError?.message || '';
      
      // Detect if GPS is disabled
      if (errorMessage.toLowerCase().includes('permission') || 
          errorMessage.toLowerCase().includes('denied') ||
          errorMessage.toLowerCase().includes('location') ||
          gpsError?.code === 1) {
        throw new Error('GPS_DISABLED');
      }
      throw new Error('GPS_ERROR');
    }

    if (!pos || !pos.coords) {
      throw new Error('GPS_UNAVAILABLE');
    }

    const photo = await Camera.getPhoto({
      quality: 85,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    const lat = pos.coords.latitude.toFixed(6);
    const lon = pos.coords.longitude.toFixed(6);

    // load image into canvas
    if (!photo || !photo.webPath) return null;
    const img = await loadImage(photo.webPath);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    // watermark styling
    const now = new Date();
    const dateTimeStr = now.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const text = `${dateTimeStr} | Lat: ${lat} , Lon: ${lon}`;
    const padding = Math.round(Math.max(10, canvas.width * 0.02));
    ctx.font = `${Math.round(Math.max(14, canvas.width * 0.03))}px sans-serif`;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const textWidth = ctx.measureText(text).width;
    const rectHeight = Math.round(parseInt(ctx.font || '16', 10) * 1.4);
    ctx.fillRect(padding - 6, canvas.height - rectHeight - padding + 6, textWidth + 12, rectHeight + 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, padding, canvas.height - padding - 6);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const blob = await fetch(dataUrl).then(r => r.blob());
    
    // Compress to 2 MB
    const compressedBlob = await compressImageBlob(blob, 2);
    const compressedDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(compressedBlob);
    });
    
    const base64 = compressedDataUrl.split(',')[1];

    const fileName = `loc_img_${Date.now()}.jpg`;
    await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Data,
    });

    const meta: SavedImageMeta = {
      fileName,
      path: fileName,
      createdAt: Date.now(),
    };

    const list = await getMetaList();
    list.unshift(meta);
    await setMetaList(list);
    return meta;
  } catch (e) {
    console.error('saveImageWithLocation error', e);
    // Re-throw GPS-specific errors so they can be caught in UI
    if (e instanceof Error && (e.message === 'GPS_DISABLED' || e.message === 'GPS_ERROR' || e.message === 'GPS_UNAVAILABLE')) {
      throw e;
    }
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

// Helper: convert File to data URL
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Helper: compress image File/Blob to max 2 MB
async function compressImageBlob(blob: Blob, maxSizeMB = 2): Promise<Blob> {
  const maxSize = maxSizeMB * 1024 * 1024;

  if (!blob.type.startsWith('image/')) {
    return blob;
  }

  if (blob.size <= maxSize) return blob;

  // Convert blob to data URL
  const file = new File([blob], 'image.jpg', { type: blob.type });
  const dataUrl = await fileToDataURL(file);
  
  const img = document.createElement('img');
  img.src = dataUrl;

  await new Promise((resolve, reject) => {
    img.onload = () => resolve(true);
    img.onerror = (e) => reject(e);
  });

  const canvas = document.createElement('canvas');
  let [width, height] = [img.naturalWidth, img.naturalHeight];

  const maxDim = 1600;
  if (Math.max(width, height) > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return blob;

  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.92;
  let compressedBlob: Blob | null = null;

  for (let i = 0; i < 8; i++) {
    compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), blob.type === 'image/png' ? 'image/jpeg' : blob.type, quality);
    });

    if (!compressedBlob) break;
    if (compressedBlob.size <= maxSize) break;

    quality = Math.max(0.4, quality - 0.12);

    if (i === 3) {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
    }
  }

  if (compressedBlob && compressedBlob.size <= blob.size) {
    return compressedBlob.size <= maxSize ? compressedBlob : blob;
  }

  return blob;
}

export async function getSavedImages(): Promise<SavedImageMeta[]> {
  return getMetaList();
}

export async function readImageDataUrl(fileName: string): Promise<string | null> {
  try {
    const read = await Filesystem.readFile({ path: fileName, directory: Directory.Data });
    let base64Data = read.data as string;
    
    // Handle already-formed data URLs
    if (base64Data.startsWith('data:image')) {
      console.log('Already a data URL:', fileName);
      return base64Data;
    }
    
    // Convert base64 to blob and create object URL
    const cleanedBase64 = base64Data.replace(/\n|\r/g, '').trim();
    const byteCharacters = atob(cleanedBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const objectUrl = URL.createObjectURL(blob);
    
    console.log('Created blob URL:', fileName);
    return objectUrl;
  } catch (e) {
    console.error('readImageDataUrl error for file:', fileName, e);
    return null;
  }
}

export async function deleteImage(fileName: string): Promise<boolean> {
  try {
    await Filesystem.deleteFile({ path: fileName, directory: Directory.Data });
  } catch (e) {
    // ignore if missing
  }
  const list = await getMetaList();
  const filtered = list.filter((m) => m.fileName !== fileName);
  await setMetaList(filtered);
  return true;
}

export async function getImageFileAsBlob(fileName: string): Promise<Blob | null> {
  const dataUrl = await readImageDataUrl(fileName);
  if (!dataUrl) return null;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return blob;
}
