import { Client } from 'minio';
import { env } from './env.js';
import { Readable } from 'stream';

let minioClient: Client | null = null;

export const getMinioClient = (): Client => {
  if (!minioClient) {
    minioClient = new Client({
      endPoint: env.minioEndpoint,
      port: env.minioPort,
      useSSL: env.minioUseSSL,
      accessKey: env.minioAccessKey,
      secretKey: env.minioSecretKey,
    });
  }
  return minioClient;
};

export const ensureBucket = async (): Promise<void> => {
  const client = getMinioClient();
  const bucketName = env.minioBucket;
  
  const exists = await client.bucketExists(bucketName);
  if (!exists) {
    await client.makeBucket(bucketName);
    console.log(`Created bucket: ${bucketName}`);
    
    // Set bucket policy to allow read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    await client.setBucketPolicy(bucketName, JSON.stringify(policy));
  }
};

export interface UploadOptions {
  contentType: string;
  metadata?: Record<string, string>;
}

export const uploadFile = async (
  objectName: string,
  buffer: Buffer,
  options: UploadOptions
): Promise<string> => {
  const client = getMinioClient();
  const bucketName = env.minioBucket;
  
  await client.putObject(bucketName, objectName, buffer, buffer.length, {
    'Content-Type': options.contentType,
    ...options.metadata,
  });
  
  return getFileUrl(objectName);
};

export const uploadStream = async (
  objectName: string,
  stream: Readable,
  size: number,
  options: UploadOptions
): Promise<string> => {
  const client = getMinioClient();
  const bucketName = env.minioBucket;
  
  await client.putObject(bucketName, objectName, stream, size, {
    'Content-Type': options.contentType,
    ...options.metadata,
  });
  
  return getFileUrl(objectName);
};

export const getFileUrl = (objectName: string): string => {
  const protocol = env.minioUseSSL ? 'https' : 'http';
  const port = env.minioPort === 80 || env.minioPort === 443 ? '' : `:${env.minioPort}`;
  return `${protocol}://${env.minioEndpoint}${port}/${env.minioBucket}/${objectName}`;
};

export const getPresignedUploadUrl = async (
  objectName: string,
  expiry = 3600 // 1 hour default
): Promise<string> => {
  const client = getMinioClient();
  return client.presignedPutObject(env.minioBucket, objectName, expiry);
};

export const getPresignedDownloadUrl = async (
  objectName: string,
  expiry = 3600
): Promise<string> => {
  const client = getMinioClient();
  return client.presignedGetObject(env.minioBucket, objectName, expiry);
};

export const deleteFile = async (objectName: string): Promise<void> => {
  const client = getMinioClient();
  await client.removeObject(env.minioBucket, objectName);
};

export const deleteFiles = async (objectNames: string[]): Promise<void> => {
  const client = getMinioClient();
  await client.removeObjects(env.minioBucket, objectNames);
};

export const fileExists = async (objectName: string): Promise<boolean> => {
  const client = getMinioClient();
  try {
    await client.statObject(env.minioBucket, objectName);
    return true;
  } catch (error: any) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

export const getFileInfo = async (objectName: string): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
  metadata: Record<string, string>;
} | null> => {
  const client = getMinioClient();
  try {
    const stat = await client.statObject(env.minioBucket, objectName);
    return {
      size: stat.size,
      contentType: stat.metaData['content-type'] || 'application/octet-stream',
      lastModified: stat.lastModified,
      metadata: stat.metaData,
    };
  } catch (error: any) {
    if (error.code === 'NotFound') {
      return null;
    }
    throw error;
  }
};

// Generate object name with organized path structure
export const generateObjectName = (
  type: 'images' | 'files' | 'voice' | 'video' | 'avatars' | 'thumbnails',
  conversationId: string,
  filename: string
): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  const ext = filename.split('.').pop() || '';
  const safeName = `${timestamp}-${random}.${ext}`;
  
  return `${type}/${year}/${month}/${day}/${conversationId}/${safeName}`;
};
