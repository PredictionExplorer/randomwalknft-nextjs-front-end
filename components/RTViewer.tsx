import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Box } from "@mui/material";
const RTViewer = ({ content }) => {
  return (
    <Box sx={{ color: "#000", my: "10px" }}>
      <CKEditor
        editor={ClassicEditor}
        config={{
          toolbar: [],
        }}
        data={content}
      />
    </Box>
  );
};

export default RTViewer;
