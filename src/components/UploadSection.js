import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, List, ListItem, Paper, Typography, TextField, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import React, { useRef, useState } from 'react';



const UploadButton = styled(Button)(({ theme }) => ({
  background: 'var(--primary)',
  color: 'var(--primary-foreground)',
  // padding: '12px 24px',
  borderRadius: theme.spacing(1),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 3px 5px rgba(0,0,0,.08)',
  '&:hover': {
    filter: 'brightness(0.95)'
  }
}));

// Add animation keyframes
const successAnimation = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

 

function UploadSection() {
  const [fileList, setFileList] = useState([]);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' | 'error' | ''
  const [customName, setCustomName] = useState('');
  const [fileType, setFileType] = useState('auto');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const folderInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const first = files[0] ? [files[0]] : [];
    setFileList(first);
    // Clear banners when new selection happens
    setStatusMessage('');
    setStatusType('');
    console.log("File selected:", first);
  };

  const handleSelectFiles = () => {
    fileInputRef.current.click();
  };

  const handleSelectFolder = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setFileList(files);
    // Clear banners when new selection happens
    setStatusMessage('');
    setStatusType('');
    console.log("Folder selected, files:", files);
  };

  const getExtensionFromTypeOrOriginal = (file) => {
    if (!file) return '';
    const map = {
      pdf: '.pdf',
      docx: '.docx',
      doc: '.doc',
      txt: '.txt',
      png: '.png',
      jpg: '.jpg',
      jpeg: '.jpeg',
      csv: '.csv',
      xlsx: '.xlsx',
      pptx: '.pptx'
    };
    if (fileType && fileType !== 'auto' && map[fileType]) return map[fileType];
    const dot = file.name.lastIndexOf('.');
    return dot >= 0 ? file.name.slice(dot) : '';
  };

  // Function to check for existing file/folder names and block if taken
  const ensureNameIsAvailable = async (candidate, isFolder) => {
    try {
      const query = candidate ? `?search=${encodeURIComponent(candidate)}` : '';
      const response = await fetch(`/api/notes${query}`);
      if (response.ok) {
        const existing = await response.json();
        if (Array.isArray(existing)) {
          const exists = existing.some((n) => {
            if (isFolder) {
              // For folder, treat any key that equals candidate or starts with candidate+
              return n === candidate || n.startsWith(candidate.endsWith('/') ? candidate : candidate + '/');
            }
            return n === candidate;
          });
          if (exists) {
            setStatusType('error');
            setStatusMessage('Name already taken. Please choose a different name.');
            return false;
          }
        }
      }
    } catch (e) {
      // If check fails, allow upload to proceed and rely on backend 409
      console.warn('Name availability check failed, relying on server:', e);
      return true;
    }
    return true;
  };

  const computeFinalFilename = (file) => {
    const trimmed = (customName || '').trim();
    if (!trimmed) {
      // Fall back to original filename when custom name not provided
      return file?.name || '';
    }
    // If user already provided an extension, respect it
    if (trimmed.includes('.')) return trimmed;
    const ext = getExtensionFromTypeOrOriginal(file);
    return `${trimmed}${ext || ''}`;
  };

  const getPreviewPath = (file) => {
    if (!file) return '';
    const originalRootDir = (fileList[0]?.webkitRelativePath || '').split('/')[0] || '';
    let rel = file.webkitRelativePath && file.webkitRelativePath.length > 0 ? file.webkitRelativePath : file.name;
    
    // If custom name is provided, replace the root folder name in preview
    if (customName && customName.trim() && originalRootDir) {
      const customNameTrimmed = customName.trim();
      if (rel.startsWith(originalRootDir + '/')) {
        rel = rel.replace(originalRootDir + '/', customNameTrimmed + '/');
      } else if (rel === originalRootDir) {
        rel = customNameTrimmed;
      }
    }
    
    return rel;
  };

  const validate = () => {
    const nextErrors = {};
    if (fileList.length === 0) nextErrors.file = 'Please select a file or folder';
    // Custom name no longer required for single-file uploads
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadComplete(false);

    if (!validate()) {
      setIsUploading(false);
      return;
    }
    
    const formData = new FormData();
    const isFolderUpload = fileList.length > 1 || (fileList[0] && fileList[0].webkitRelativePath);
    
    if (!isFolderUpload && fileList.length === 1) {
      // Single file upload — allow any file type and allow original name if no custom name
      const file = fileList[0];
      const finalName = computeFinalFilename(file);
      const ok = await ensureNameIsAvailable(finalName, false);
      if (!ok) { setIsUploading(false); return; }
      formData.append('files', file, finalName);
      if (customName && customName.trim()) {
        formData.append('customName', finalName);
      }
      formData.append('originalName', file.name);
      if (fileType && fileType !== 'auto') formData.append('fileType', fileType);
      if (description) formData.append('description', description);
    } else {
      // Folder upload: rename the root folder to custom name if provided
      const manifest = [];
      const originalRootDir = (fileList[0].webkitRelativePath || '').split('/')[0] || '';
      
      // Check for unique folder name if custom name is provided
      let finalRootDir = customName && customName.trim() ? customName.trim() : originalRootDir;
      const ok = await ensureNameIsAvailable(finalRootDir, true);
      if (!ok) { setIsUploading(false); return; }
      
      fileList.forEach((f) => {
        let rel = f.webkitRelativePath && f.webkitRelativePath.length > 0 ? f.webkitRelativePath : f.name;
        
        // If custom name is provided, replace the root folder name
        if (customName && customName.trim() && originalRootDir) {
          if (rel.startsWith(originalRootDir + '/')) {
            rel = rel.replace(originalRootDir + '/', finalRootDir + '/');
          } else if (rel === originalRootDir) {
            rel = finalRootDir;
          }
        }
        
        // Set the filename header to the relative path so servers that honor it will save with folders
        formData.append('files', f, rel);
        // Also append a parallel paths field for servers that ignore the filename header
        formData.append('paths', rel);
        manifest.push({ name: f.name, path: rel, size: f.size, type: f.type });
      });
      
      formData.append('batchUpload', 'true');
      formData.append('rootDirName', finalRootDir);
      formData.append('manifest', JSON.stringify(manifest));
      if (fileType && fileType !== 'auto') formData.append('fileType', fileType);
      if (description) formData.append('description', description);
    }
    
    try {
      const response = await fetch('/api/notes/upload', {
        method: 'POST',
        body: formData
      });
      const responseText = await response.text();
      if (!response.ok) {
        if (response.status === 409) {
          setStatusType('error');
          setStatusMessage(responseText || 'Name already taken. Please choose a different name.');
          setIsUploading(false);
          return;
        }
        setStatusType('error');
        setStatusMessage(responseText || 'Upload failed. Please try again.');
      } else {
        setFileList([]);
        setCustomName('');
        setFileType('auto');
        setDescription('');
                 setUploadComplete(true);
         setStatusType('success');
         setStatusMessage(fileList.length > 1 || (fileList[0] && fileList[0].webkitRelativePath) ? 'Folder upload successful! 🎉' : 'File upload successful! 🎉');
      }
    } catch (error) {
      setStatusType('error');
      setStatusMessage('');
      window.alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Keep success/error banners visible until the user changes selection/name
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 'min(800px, 100%)', 
      width: '100%', 
      mx: 'auto', 
      p: { xs: 2, sm: 3, md: 4 },
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Typography 
        variant="h4" 
        sx={{ 
          color: 'var(--foreground)',
          mb: 4, 
          textAlign: 'center',
          fontWeight: 600
        }}
      >
        Upload Files or Folders
      </Typography>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <input
        type="file"
        ref={folderInputRef}
        style={{ display: 'none' }}
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderSelect}
      />

      {/* Content Area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        mb: fileList.length > 0 ? 4 : 0 // Add margin bottom when upload button is present
      }}>
                 {/* Upload Form */}
         <Paper sx={{ p: 3, borderRadius: 2 }}>
           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
             <TextField
               label="Name (custom file name)"
               value={customName}
               onChange={(e) => { setCustomName(e.target.value); setStatusMessage(''); setStatusType(''); }}
               error={Boolean(errors.customName)}
               helperText={errors.customName || 'This name will be used when saving and searching'}
             />
             <TextField
               label="File Type"
               select
               value={fileType}
               onChange={(e) => setFileType(e.target.value)}
               helperText="Choose extension or auto-detect"
             >
               <MenuItem value="auto">Auto (use original)</MenuItem>
               <MenuItem value="pdf">PDF (.pdf)</MenuItem>
               <MenuItem value="docx">Word (.docx)</MenuItem>
               <MenuItem value="txt">Text (.txt)</MenuItem>
               <MenuItem value="png">PNG (.png)</MenuItem>
               <MenuItem value="jpg">JPG (.jpg)</MenuItem>
               <MenuItem value="jpeg">JPEG (.jpeg)</MenuItem>
               <MenuItem value="csv">CSV (.csv)</MenuItem>
               <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
               <MenuItem value="pptx">PowerPoint (.pptx)</MenuItem>
             </TextField>
           </Box>
                       <Box sx={{ mt: 2 }}>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={3}
                fullWidth
                placeholder="Optional description about this file"
              />
            </Box>
            
            {/* File/Folder Selection inside the form */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid var(--border)' }}>
              <Typography variant="h6" sx={{ color: 'var(--foreground)', mb: 2 }}>
                Select File or Folder
              </Typography>
              {statusMessage && statusType === 'success' && (
                <Box sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  <Typography sx={{ color: '#4caf50', fontWeight: 600 }}>
                    {fileList.length > 1 || (fileList[0] && fileList[0].webkitRelativePath) ? 'Folder upload successful! 🎉' : 'File upload successful! 🎉'}
                  </Typography>
                </Box>
              )}
              {statusMessage && statusType === 'error' && (
                <Box sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: 'rgba(244, 67, 54, 0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <ErrorOutlineIcon sx={{ color: '#f44336', fontSize: 20 }} />
                  <Typography sx={{ color: '#f44336', fontWeight: 600 }}>
                    {statusMessage}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleSelectFiles}
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    bgcolor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    '&:hover': { filter: 'brightness(0.95)' }
                  }}
                >
                  Select File
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSelectFolder}
                  startIcon={<FolderOpenIcon />}
                  sx={{
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                >
                  Select Folder
                </Button>
              </Box>
              
              {/* File Preview */}
              {fileList.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ color: 'var(--foreground)', mb: 2 }}>
                    {fileList.length > 1 ? `Selected Files (${fileList.length})` : 'Selected File'}
                  </Typography>
                  <List sx={{ maxHeight: '200px', overflow: 'auto', bgcolor: 'var(--muted)', borderRadius: 1 }}>
                    {fileList.length === 1 && fileList[0] && (
                      <>
                        <ListItem sx={{ color: 'var(--foreground)', wordBreak: 'break-word' }}>
                          <Typography sx={{ overflowWrap: 'anywhere' }}>Original: {fileList[0].name}</Typography>
                        </ListItem>
                        <ListItem sx={{ color: 'var(--foreground)', wordBreak: 'break-word' }}>
                          <Typography sx={{ overflowWrap: 'anywhere' }}>Will be saved as: {computeFinalFilename(fileList[0]) || '—'}</Typography>
                        </ListItem>
                      </>
                    )}
                    {fileList.length > 1 && (
                      <>
                        {fileList.slice(0, 5).map((f, idx) => (
                          <ListItem key={idx} sx={{ color: 'var(--foreground)', wordBreak: 'break-word' }}>
                            <Typography sx={{ overflowWrap: 'anywhere' }}>{getPreviewPath(f) || f.name}</Typography>
                          </ListItem>
                        ))}
                        {fileList.length > 5 && (
                          <ListItem sx={{ color: 'var(--muted-foreground)' }}>
                            + {fileList.length - 5} more files...
                          </ListItem>
                        )}
                      </>
                    )}
                  </List>
                </Box>
              )}
            </Box>
            
            {/* Upload Button inside the form */}
            {fileList.length > 0 && (
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid var(--border)' }}>
                <UploadButton
                  fullWidth
                  onClick={handleUpload}
                  disabled={isUploading}
                  startIcon={
                    isUploading ? (
                      <CloudUploadIcon sx={{
                        animation: `${rotateAnimation} 1s linear infinite`,
                        color: 'inherit'
                      }} />
                    ) : uploadComplete ? (
                      <CheckCircleIcon sx={{
                        animation: `${successAnimation} 0.5s ease-out`,
                        color: '#4caf50'
                      }} />
                    ) : (
                      <CloudUploadIcon />
                    )
                  }
                  sx={{
                    opacity: isUploading ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    height: '56px',
                    fontSize: '1.1rem'
                  }}
                >
                  {isUploading ? 'Uploading...' : uploadComplete ? 'Upload Complete!' : (fileList.length > 1 ? 'Upload Folder' : 'Upload File')}
                </UploadButton>
                {isUploading && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: 4, 
                      bgcolor: 'var(--muted)', 
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '30%',
                        bgcolor: 'var(--primary)',
                        borderRadius: 2,
                        animation: `${pulseAnimation} 1.5s ease-in-out infinite`
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                      Uploading...
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
         </Paper>

        

        
      </Box>

      

             {/* Progress Bar */}
       {isUploading && (
         <Box
           sx={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             height: 4,
             zIndex: 9999,
             overflow: 'hidden',
             bgcolor: 'var(--muted)',
             '&::after': {
               content: '""',
               display: 'block',
               position: 'absolute',
               left: '-100%',
               width: '100%',
               height: '100%',
               background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
               animation: `shimmer 2s ease-in-out infinite`,
               '@keyframes shimmer': {
                 '0%': {
                   left: '-100%',
                 },
                 '100%': {
                   left: '100%',
                 },
               },
             },
           }}
         />
       )}
    </Box>
  );
}

export default UploadSection;
