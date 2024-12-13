import React, { useEffect, useState } from "react";
import { Snack } from "snack-sdk";
import QRCode from "react-qr-code";
import "./App.css";

const App = () => {
  const [snack] = useState(() => new Snack({ online: true }));
  const [fileName, setFileName] = useState("App.js");
  const [fileContent, setFileContent] = useState(
    snack.getState().files[fileName]?.contents || ""
  );
  const [downloadUrl, setDownloadUrl] = useState("");
  const [webPreviewRef, setWebPreviewRef] = useState(null);

  useEffect(() => {
    const fetchDownloadUrl = async () => {
      const url = await snack.getDownloadURLAsync();
      setDownloadUrl(url);
    };

    const handleStateChange = (state) => {
      if (state.files[fileName]) {
        setFileContent(state.files[fileName].contents);
      }
    };

    snack.addStateListener(handleStateChange);
    fetchDownloadUrl();

    // No need to remove the state listener
    return () => {
      // Do nothing or clean up other resources if necessary
    };
  }, [fileName, snack]);

  const handleFileChange = (name) => {
    setFileName(name);
    setFileContent(snack.getState().files[name].contents);
  };

  const handleContentChange = (content) => {
    setFileContent(content);
    snack.updateFiles({
      [fileName]: {
        type: "CODE",
        contents: content,
      },
    });
  };

  const handleSave = async () => {
    const { id, url } = await snack.saveAsync();
    console.log(`Snack saved with ID: ${id}, URL: ${url}`);
  };

  const { url } = snack.getState();

  return (
    <div className="app-container">
      <div className="file-explorer">
        <h2>File Explorer</h2>
        {Object.keys(snack.getState().files).map((name) => (
          <div
            key={name}
            className="file-item"
            onClick={() => handleFileChange(name)}
          >
            {name}
          </div>
        ))}
      </div>
      <div className="editor-container">
        <h2>Code Editor</h2>
        <textarea
          className="code-editor"
          value={fileContent}
          onChange={(e) => handleContentChange(e.target.value)}
        />
        <button onClick={handleSave}>Save Snack</button>
        <h2>Preview QR Code</h2>
        <QRCode value={url} />
        <h2>Download Source</h2>
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
          Download
        </a>
      </div>
      <iframe
        ref={(ref) => setWebPreviewRef(ref)}
        src={snack.getState().webPreviewURL}
        title="Web Preview"
        className="web-preview"
        style={{ width: "100%", height: "400px", border: "none" }}
      />
    </div>
  );
};

export default App;
