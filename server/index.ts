import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Initialize Google Cloud Vision client
let vision: ImageAnnotatorClient;
try {
  console.log('Initializing Google Cloud Vision client...');
  
  // In Cloud Run, we'll use the default credentials
  if (process.env.NODE_ENV === 'production') {
    vision = new ImageAnnotatorClient();
    console.log('Using default credentials in production');
  } else {
    const credentialsPath = '/Users/pratikgaad/Desktop/Python/SnappSell/Config/snappsell-e9567aab86d7.json';
    console.log('Using local credentials path:', credentialsPath);
    
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Credentials file not found at: ${credentialsPath}`);
    }
    
    vision = new ImageAnnotatorClient({
      keyFilename: credentialsPath,
    });
  }
  
  console.log('Google Cloud Vision client initialized successfully');
} catch (error: any) {
  console.error('Error initializing Google Cloud Vision client:', {
    message: error.message,
    stack: error.stack,
    code: error.code,
    details: error.details,
    status: error.status,
    statusCode: error.statusCode,
    errors: error.errors,
    response: error.response?.data,
    name: error.name,
    serviceError: error.serviceError
  });
  process.exit(1); // Exit if we can't initialize the Vision client
}

// Update CORS configuration to accept any origin in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow any origin in production
    : 'http://localhost:5173', // Local development
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Endpoint to process images
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Processing image...');
    console.log('File details:', {
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      fieldname: req.file.fieldname
    });
    
    // Perform label detection
    console.log('Sending request to Vision API...');
    try {
      console.log('Request payload:', {
        imageSize: req.file.buffer.length,
        mimeType: req.file.mimetype
      });
      
      const [result] = await vision.labelDetection({
        image: {
          content: req.file.buffer,
        },
      });
      
      if (!result) {
        throw new Error('No response from Vision API');
      }
      
      console.log('Vision API response:', JSON.stringify(result, null, 2));

      const labels = result.labelAnnotations?.map(label => ({
        description: label.description,
        confidence: label.score,
      })) || [];

      // Sort labels by confidence
      labels.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

      // Return top 5 most confident labels
      const topLabels = labels.slice(0, 5).map(label => label.description);
      console.log('Sending labels:', topLabels);
      
      res.json({
        labels: topLabels,
      });
    } catch (error: any) {
      console.error('Vision API Error Details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        statusCode: error.statusCode,
        errors: error.errors
      });
      throw error;
    }
  } catch (error: any) {
    console.error('Error processing image:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      statusCode: error.statusCode,
      errors: error.errors
    });
    res.status(500).json({ 
      error: 'Error processing image',
      details: error.message || 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for http://localhost:5173`);
  console.log('Google Cloud credentials path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
}); 