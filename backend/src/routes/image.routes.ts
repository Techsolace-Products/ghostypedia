import { Router, Request, Response } from 'express';
import { imagekitService } from '../services';
import { authenticateSession } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

const expressValidator = require('express-validator');
const { body } = expressValidator;

const router = Router();

/**
 * POST /api/images/upload
 * Upload an image to ImageKit
 */
router.post(
  '/upload',
  authenticateSession,
  [
    body('file').notEmpty().withMessage('File is required'),
    body('fileName').notEmpty().withMessage('File name is required'),
    body('folder').optional().isString(),
    body('tags').optional().isArray(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { file, fileName, folder, tags } = req.body;

      // If file is a buffer, validate it
      if (Buffer.isBuffer(file)) {
        const validation = imagekitService.validateFile(file, fileName);
        if (!validation.valid) {
          res.status(400).json({ error: validation.error });
          return;
        }
      }

      const result = await imagekitService.uploadImage({
        file,
        fileName,
        folder,
        tags,
      });

      res.json({
        success: true,
        data: {
          fileId: result.fileId,
          name: result.name,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          filePath: result.filePath,
        },
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

/**
 * POST /api/images/upload/ghost
 * Upload a ghost image with metadata
 */
router.post(
  '/upload/ghost',
  authenticateSession,
  [
    body('file').notEmpty().withMessage('File is required'),
    body('fileName').notEmpty().withMessage('File name is required'),
    body('ghostId').notEmpty().withMessage('Ghost ID is required'),
    body('tags').optional().isArray(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { file, fileName, ghostId, tags } = req.body;

      // If file is a buffer, validate it
      if (Buffer.isBuffer(file)) {
        const validation = imagekitService.validateFile(file, fileName);
        if (!validation.valid) {
          res.status(400).json({ error: validation.error });
          return;
        }
      }

      const result = await imagekitService.uploadGhostImage(
        file,
        ghostId,
        fileName,
        tags
      );

      res.json({
        success: true,
        data: {
          fileId: result.fileId,
          name: result.name,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          filePath: result.filePath,
        },
      });
    } catch (error) {
      console.error('Ghost image upload error:', error);
      res.status(500).json({ error: 'Failed to upload ghost image' });
    }
  }
);

/**
 * GET /api/images/auth
 * Get authentication parameters for client-side upload
 */
router.get('/auth', authenticateSession, (_req: Request, res: Response) => {
  try {
    const authParams = imagekitService.getAuthenticationParameters();
    res.json({
      success: true,
      data: authParams,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ error: 'Failed to generate authentication parameters' });
  }
});

/**
 * GET /api/images/:fileId
 * Get image details
 */
router.get('/:fileId', authenticateSession, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const details = await imagekitService.getImageDetails(fileId);

    res.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Get image details error:', error);
    res.status(500).json({ error: 'Failed to get image details' });
  }
});

/**
 * DELETE /api/images/:fileId
 * Delete an image
 */
router.delete('/:fileId', authenticateSession, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    await imagekitService.deleteImage(fileId);

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

/**
 * GET /api/images/list/:folder?
 * List images in a folder
 */
router.get('/list/:folder?', authenticateSession, async (req: Request, res: Response) => {
  try {
    const { folder } = req.params;
    const { tags } = req.query;

    const tagArray = tags ? (tags as string).split(',') : undefined;
    const images = await imagekitService.listImages(folder, tagArray);

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

export default router;
