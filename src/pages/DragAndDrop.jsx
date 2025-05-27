import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  IconButton,

} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AddIcon from "@mui/icons-material/Add";

// Component for Drag-and-Drop File Upload
const ManageCustomer = () => {
  const [files, setFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    multiple: true,
  });

  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Page Title */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Upload your meal
        </Typography>
        {/* User Icon / Other Action */}
        <IconButton>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          mt: 5,
          padding: "40px",
          textAlign: "center",
          backgroundColor: isDragActive ? "#f0f0f0" : "#fafafa",
          border: "2px dashed #ccc",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ marginBottom: "30px" }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1379/1379311.png"
            alt="Upload Illustration"
            style={{ width: "150px", marginBottom: "20px" }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Drag and Drop Your File Here!
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Please upload <strong>PDF, DOCX, DOC,</strong> or{" "}
          <strong>XLSX</strong> files
        </Typography>
        <Typography variant="body2" sx={{ color: "gray", mt: 1 }}>
          A file maximum size should be <strong>5 MB</strong>
        </Typography>

        {/* Buttons */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4, justifyContent: "center" }}
        >
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            sx={{ padding: "10px 20px" }}
          >
            Upload a File
          </Button>
          <Button variant="outlined" sx={{ padding: "10px 20px" }}>
            Enter Data Manually
          </Button>
        </Stack>
      </Paper>

      {/* Display the up  loaded files */}
      {files.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Uploaded Files:
          </Typography>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default ManageCustomer;
