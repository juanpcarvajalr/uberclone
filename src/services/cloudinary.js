// AI-assisted: see docs/AI_LOG.md #34, #35, #36
import { CLOUDINARY } from '../config/cloudinary';

/**
 * Converts a local file URI into a Blob (XHR works with file:// in RN/Expo).
 * @param {string} uri
 * @returns {Promise<Blob>}
 */
function uriToBlob(uri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
        return;
      }
      reject(new Error(`No se pudo leer la imagen local (${xhr.status})`));
    };
    xhr.onerror = () => {
      reject(new Error('No se pudo leer la imagen local'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

/**
 * Uploads a local image URI to Cloudinary (unsigned preset).
 * @param {string} uri
 * @param {string} [folder]
 * @returns {Promise<string>}
 */
export async function uploadImage(uri, folder = 'uberclone') {
  try {
    if (!uri) {
      throw new Error('Missing image uri');
    }

    const fileName = uri.split('/').pop()?.split('?')[0] ?? `photo_${Date.now()}.jpg`;
    const blob = await uriToBlob(uri);

    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('upload_preset', CLOUDINARY.uploadPreset);
    formData.append('folder', folder);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cloudinary upload failed: ${text}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
