import React, { useState, useRef, useEffect } from "react";
import { Snack } from "snack-sdk";
import Editor from "@monaco-editor/react";
import QRCode from "react-qr-code";

const App = () => {
  const webPreviewRef = useRef(null);
  const [code, setCode] = useState(`import * as React from 'react';
import { View, Text } from 'react-native';

export default () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Hello from Snack!</Text>
  </View>
);`);
  const [snack] = useState(
    () =>
      new Snack({
        online: true,
        files: {
          "App.js": {
            type: "CODE",
            contents: code,
          },
        },
        webPreviewRef,
      })
  );
  const [webPreviewURL, setWebPreviewURL] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("Mobile");

  useEffect(() => {
    const fetchDownloadUrl = async () => {
      const url = await snack.getDownloadURLAsync();
      setDownloadUrl(url);
    };

    const updateWebPreviewURL = () => {
      const { webPreviewURL: newURL } = snack.getState();
      setWebPreviewURL(newURL);
    };

    const stateListener = snack.addStateListener(updateWebPreviewURL);

    fetchDownloadUrl();
    snack.setOnline(true);

    return () => {
      snack.setOnline(false);
    };
  }, [snack]);

  const handleSave = async () => {
    const { id, url } = await snack.saveAsync();
    console.log(`Snack saved with ID: ${id}, URL: ${url}`);
  };

  const handleCodeChange = (newCode) => {
    if (newCode !== null) {
      setCode(newCode);
      snack.updateFiles({
        "App.js": {
          type: "CODE",
          contents: newCode,
        },
      });
    }
  };

  const handleDeviceOptionChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  const { url } = snack.getState();

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Snack Web Preview</h1>
            <div style={styles.headerActions}>
              <button style={styles.actionButton} onClick={handleSave}>
                Save Snack
              </button>
              <button style={styles.actionButton}>Share</button>
            </div>
          </div>
        </header>

        <div style={styles.workspace}>
          <div style={styles.editorPanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Code Editor</h2>
            </div>
            <div style={styles.editorContainer}>
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollbar: { vertical: "hidden" },
                  lineNumbers: "on",
                  glyphMargin: false,
                }}
              />
            </div>
          </div>

          <div style={styles.previewPanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Live Preview</h2>
              <div style={styles.deviceSelector}>
                <select
                  style={styles.deviceDropdown}
                  value={selectedDevice}
                  onChange={handleDeviceOptionChange}
                >
                  <option>Mobile</option>
                  <option>Tablet</option>
                  <option>My Device</option>
                </select>
              </div>
            </div>
            <div style={styles.previewContainer}>
              {selectedDevice === "My Device" ? (
                <QRCode value={url} />
              ) : (
                <>
                  {webPreviewURL ? (
                    <iframe
                      ref={(c) =>
                        (webPreviewRef.current = c?.contentWindow ?? null)
                      }
                      src={webPreviewURL}
                      allow="geolocation; camera; microphone"
                      style={styles.iframe}
                      title="Snack Web Preview"
                    />
                  ) : (
                    <div style={styles.loadingOverlay}>
                      <div style={styles.spinner}></div>
                      <p style={styles.loadingText}>
                        Preparing your preview...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const colors = {
  background: "#f0f2f5",
  primary: "#2c3e50",
  secondary: "#3498db",
  text: "#333",
  border: "#e0e4e8",
  white: "#ffffff",
};

const styles = {
  app: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    backgroundColor: colors.background,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 0",
  },
  container: {
    width: "95%",
    maxWidth: "1400px",
    backgroundColor: colors.white,
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  header: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: "15px 20px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
  },
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  actionButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: colors.white,
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  workspace: {
    display: "flex",
    height: "calc(100vh - 150px)",
    minHeight: "600px",
  },
  editorPanel: {
    flex: "1",
    borderRight: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
  },
  previewPanel: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    backgroundColor: colors.background,
    borderBottom: `1px solid ${colors.border}`,
  },
  panelTitle: {
    margin: 0,
    fontSize: "16px",
    color: colors.text,
    fontWeight: 600,
  },
  editorTabs: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  activeTab: {
    backgroundColor: colors.secondary,
    color: colors.white,
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "12px",
  },
  inactiveTab: {
    color: colors.secondary,
    cursor: "pointer",
    fontSize: "18px",
  },
  editorContainer: {
    flex: 1,
    overflow: "hidden",
  },
  deviceSelector: {
    display: "flex",
    alignItems: "center",
  },
  deviceDropdown: {
    padding: "5px 10px",
    borderRadius: "4px",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.white,
    fontSize: "12px",
  },
  previewContainer: {
    flex: 1,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  loadingOverlay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "3px solid rgba(44, 62, 80, 0.2)",
    borderTop: "3px solid #2c3e50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "15px",
    color: colors.primary,
    fontWeight: 500,
  },
};

// Add spinner animation
const styleBlock = document.createElement("style");
styleBlock.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @media (max-width: 1024px) {
    .workspace {
      flex-direction: column;
      height: auto;
    }
    .editorPanel, .previewPanel {
      width: 100%;
      height: 500px;
    }
  }
`;
document.head.appendChild(styleBlock);

export default App;
