import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Box } from "@mui/material";
const RTEditor = ({ content, setContent }) => {
  return (
    <Box sx={{ color: "#000", my: "10px" }}>
      <CKEditor
        editor={ClassicEditor}
        config={{
          toolbar: [
            "heading",
            "bold",
            "italic",
            "bulletedList",
            "numberedList",
            "undo",
            "redo",
          ],
        }}
        data={content}
        onChange={(event, editor) => {
          const data = editor.getData();
          setContent(data);
        }}
      />
    </Box>
  );
};

export default RTEditor;
