import { uploadFile } from "./api-client";
import type { ImageAsset } from "./assets";

export interface AssetsForUpload {
  sourceVideo: File | null;
  styleVideo: File | null;
  images: ImageAsset[];
  audio: File | null;
}

export interface UploadedAssetUrls {
  images: string[];
  videos: string[];
  audio: string[];
}

// Uploads every in-memory asset to /api/upload-asset and groups the
// resulting URLs by type, preserving order: source video before style
// video, images in their existing (upload) order, then the single audio
// file. This must match the order buildAssetRoleList (src/lib/assets.ts)
// used to number @Video1/@Video2/@ImageN/@Audio1 in the generation prompt.
export async function uploadAssetsForGeneration(assets: AssetsForUpload): Promise<UploadedAssetUrls> {
  const videoFiles = [assets.sourceVideo, assets.styleVideo].filter(
    (file): file is File => file !== null
  );
  const audioFiles = assets.audio ? [assets.audio] : [];

  const [videos, images, audio] = await Promise.all([
    Promise.all(videoFiles.map((file) => uploadFile(file))),
    Promise.all(assets.images.map((image) => uploadFile(image.file))),
    Promise.all(audioFiles.map((file) => uploadFile(file))),
  ]);

  return { images, videos, audio };
}
