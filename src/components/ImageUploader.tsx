import React, { useState, useRef, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Stack,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ScanIcon from '@mui/icons-material/QrCodeScanner';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ObjectDetection {
  name: string;
  confidence: number;
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

const ImageUploader: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [objects, setObjects] = useState<ObjectDetection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedObjects, setSavedObjects] = useState<ObjectDetection[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleImageUpload = async (file: File) => {
    if (file) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Create a preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Send to backend for processing
        const formData = new FormData();
        formData.append('image', file);

        console.log('Sending image to backend...');
        const response = await fetch(`${API_URL}/api/analyze-image`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to process image');
        }

        const data = await response.json();
        console.log('Received data:', data);
        setTags(data.labels || []);
        setObjects(data.objects || []);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while processing the image');
        setTags([]);
        setObjects([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const captureFrame = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            await handleImageUpload(file);
            stopScanning();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleObjectClick = (object: ObjectDetection) => {
    if (!savedObjects.some(obj => obj.name === object.name)) {
      setSavedObjects([...savedObjects, object]);
    }
  };

  const removeSavedObject = (index: number) => {
    setSavedObjects(savedObjects.filter((_, i) => i !== index));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Identify Objects
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            p: 3, 
            textAlign: 'center',
            mb: 2,
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {isScanning ? (
              <Box sx={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={captureFrame}
                  sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}
                >
                  Capture
                </Button>
              </Box>
            ) : selectedImage ? (
              <Box sx={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
                <img 
                  ref={imageRef}
                  src={selectedImage} 
                  alt="Uploaded item" 
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                />
                {objects.map((obj, index) => (
                  <Box
                    key={index}
                    onClick={() => handleObjectClick(obj)}
                    sx={{
                      position: 'absolute',
                      left: `${obj.boundingBox.left}%`,
                      top: `${obj.boundingBox.top}%`,
                      width: `${obj.boundingBox.width}%`,
                      height: `${obj.boundingBox.height}%`,
                      border: '2px solid #FFD700',
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        backgroundColor: '#FFD700',
                        color: 'black',
                        fontSize: '12px',
                        padding: '2px 4px',
                        borderRadius: '0 0 4px 4px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {obj.name} ({Math.round(obj.confidence * 100)}%)
                    </Typography>
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 2
                  }}>
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'gray', mb: 2 }} />
                <Typography color="textSecondary">
                  Take a photo or upload an image
                </Typography>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload"
            />
            
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<ScanIcon />}
                onClick={isScanning ? stopScanning : startScanning}
                disabled={isLoading}
              >
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </Button>
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={isLoading}
                >
                  Upload
                </Button>
              </label>
            </Stack>
          </Box>

          {tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detected Tags:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    color="primary" 
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {savedObjects.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Saved Objects:
              </Typography>
              <List>
                {savedObjects.map((obj, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeSavedObject(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={obj.name}
                      secondary={`Confidence: ${Math.round(obj.confidence * 100)}%`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImageUploader; 