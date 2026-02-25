export class FileUtil {
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  private static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];
  private static readonly ALLOWED_SOURCE_TYPES = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/octet-stream',
  ];

  static validateFileSize(size: number): boolean {
    return size <= this.MAX_FILE_SIZE;
  }

  static validateImageType(mimeType: string): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(mimeType);
  }

  static validateVideoType(mimeType: string): boolean {
    return this.ALLOWED_VIDEO_TYPES.includes(mimeType);
  }

  static validatePreviewType(mimeType: string): boolean {
    return this.validateImageType(mimeType) || this.validateVideoType(mimeType);
  }

  static validateSourceType(mimeType: string): boolean {
    return this.ALLOWED_SOURCE_TYPES.includes(mimeType);
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static generateS3Key(
    prefix: string,
    filename: string,
    userId: string,
  ): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${prefix}/${userId}/${timestamp}-${sanitizedFilename}`;
  }
}
