import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Box } from "@mui/material";
const RTViewer = ({ content }) => {
  return (
    <Box sx={{ my: "10px" }}>
      <CKEditor
        editor={ClassicEditor}
        onReady={(editor) => {
          const toolbarElement = editor.ui.view.toolbar.element;
          toolbarElement.style.display = "none";
          editor.enableReadOnlyMode("feature-id");
          let editableElement = editor.ui.view.editable._editableElement;
          editableElement.style.backgroundColor = "#000";
          editableElement.style.border = "none";
        }}
        data={content}
      />
    </Box>
  );
};

export default RTViewer;
