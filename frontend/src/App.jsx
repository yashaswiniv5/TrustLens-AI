import { useState } from "react";
import "./App.css";
import Tesseract from "tesseract.js";

// Colour for each risk band. The gauge, the badge and the category card all
// read from the same riskLevel, so they can never disagree.
const RISK_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#facc15",
  LOW: "#4ade80",
};

function App() {
  // ==================================================
  // NAVIGATION
  // ==================================================

  const [activePage, setActivePage] = useState("analyze");

  // ==================================================
  // ANALYZER MODE
  // ==================================================

  const [activeMode, setActiveMode] = useState("message");

  // ==================================================
  // MESSAGE ANALYZER
  // ==================================================

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================================
  // URL ANALYZER
  // ==================================================

  const [url, setUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  // ==================================================
  // SCREENSHOT ANALYZER
  // ==================================================

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");

  // ==================================================
  // TRUST REPORT
  // ==================================================

  const [result, setResult] = useState(null);

  // ==================================================
  // HISTORY
  // ==================================================

  const [history, setHistory] = useState([]);

  // ==================================================
  // AI ASSISTANT
  // ==================================================

  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantSource, setAssistantSource] = useState(null);

  const [assistantMessages, setAssistantMessages] = useState([
    {
      sender: "ai",
      text:
        "Hi! I'm your TrustLens AI Safety Assistant. Ask me anything about scams and online safety: a suspicious message, a link you are unsure about, a job or investment offer, an OTP you already shared, or what to do after you clicked.\n\nYou can also ask me to explain the report above.",
    },
  ]);

  // ==================================================
  // RESET ASSISTANT
  // ==================================================

  const resetAssistantMessages = () => {
    setAssistantMessages([
      {
        sender: "ai",
        text:
          "Hi! I'm your TrustLens AI Safety Assistant. Ask me about any scam, suspicious message or account problem.\n\nWhat would you like to know?",
      },
    ]);
  };

  // ==================================================
  // ADD TO HISTORY
  // ==================================================

  const addToHistory = (data) => {
    const historyItem = {
      id: Date.now(),
      type: data.type,
      input: data.input,
      trustScore: data.trustScore,
      riskLevel: data.riskLevel,
      category: data.category,
      categoryReason: data.categoryReason || "",
      indicators: data.indicators || [],
      recommendation: data.recommendation,
      extractedText: data.extractedText || "",
      analyzedURL: data.analyzedURL || "",
      date: new Date().toLocaleString(),
    };

    setHistory((previousHistory) => [
      historyItem,
      ...previousHistory,
    ]);
  };

  // ==================================================
  // MESSAGE ANALYZER
  // ==================================================

  const analyzeMessage = async () => {
    if (!message.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Message analysis failed"
        );
      }

      setResult(data);

      // Save analysis to history
      addToHistory({
        type: "Message",
        input: message.trim(),
        trustScore: data.trustScore,
        riskLevel: data.riskLevel,
        category: data.category,
        categoryReason: data.categoryReason,
        indicators: data.indicators,
        recommendation: data.recommendation,
      });
    } catch (error) {
      console.error(
        "Message analysis error:",
        error
      );

      alert(
        error.message ||
          "Unable to connect to TrustLens AI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // URL ANALYZER
  // ==================================================

  const analyzeURL = async () => {
    if (!url.trim()) {
      return;
    }

    setUrlLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "URL analysis failed"
        );
      }

      setResult(data);

      // Save URL analysis to history
      addToHistory({
        type: "Website",
        input: url.trim(),
        trustScore: data.trustScore,
        riskLevel: data.riskLevel,
        category: data.category,
        categoryReason: data.categoryReason,
        indicators: data.indicators,
        recommendation: data.recommendation,
        analyzedURL: data.analyzedURL,
      });
    } catch (error) {
      console.error(
        "URL analysis error:",
        error
      );

      alert(
        error.message ||
          "Unable to analyze the URL."
      );
    } finally {
      setUrlLoading(false);
    }
  };

  // ==================================================
  // SCREENSHOT SELECTION
  // ==================================================

  const handleImageSelect = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(
        "Image size must be less than 10 MB."
      );
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const previewURL =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewURL);
    setExtractedText("");
    setResult(null);
    setOcrProgress(0);
  };

  // ==================================================
  // SCREENSHOT OCR + ANALYSIS
  // ==================================================

  const analyzeScreenshot = async () => {
    if (!selectedImage) {
      alert(
        "Please select a screenshot first."
      );
      return;
    }

    setOcrLoading(true);
    setResult(null);
    setExtractedText("");
    setOcrProgress(0);

    try {
      const { data } =
        await Tesseract.recognize(
          selectedImage,
          "eng",
          {
            logger: (info) => {
              if (
                info.status ===
                "recognizing text"
              ) {
                setOcrProgress(
                  Math.round(
                    info.progress * 100
                  )
                );
              }
            },
          }
        );

      const text =
        data.text.trim();

      if (!text) {
        alert(
          "No readable text was detected in this screenshot."
        );
        return;
      }

      setExtractedText(text);

      const response = await fetch(
        "http://localhost:5000/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const analysis =
        await response.json();

      if (!response.ok) {
        throw new Error(
          analysis.error ||
            "Screenshot analysis failed"
        );
      }

      setResult({
        ...analysis,
        sourceType: "Screenshot",
        extractedText: text,
      });

      // Save screenshot analysis to history
      addToHistory({
        type: "Screenshot",
        input: text,
        trustScore:
          analysis.trustScore,
        riskLevel:
          analysis.riskLevel,
        category:
          analysis.category,
        categoryReason:
          analysis.categoryReason,
        indicators:
          analysis.indicators,
        recommendation:
          analysis.recommendation,
        extractedText: text,
      });
    } catch (error) {
      console.error(
        "Screenshot analysis error:",
        error
      );

      alert(
        error.message ||
          "Unable to analyze the screenshot."
      );
    } finally {
      setOcrLoading(false);
    }
  };

  // ==================================================
  // CLEAR CURRENT ANALYSIS
  // ==================================================

  const clearAnalysis = () => {
    setMessage("");
    setUrl("");
    setResult(null);

    setSelectedImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImagePreview("");
    setExtractedText("");
    setOcrProgress(0);

    resetAssistantMessages();
  };

  // ==================================================
  // OPEN HISTORY RESULT
  // ==================================================

  const openHistoryResult = (item) => {
    setResult({
      trustScore: item.trustScore,
      riskLevel: item.riskLevel,
      category: item.category,
      categoryReason: item.categoryReason || "",
      indicators: item.indicators,
      recommendation:
        item.recommendation,
      sourceType: item.type,
      extractedText:
        item.extractedText,
      analyzedURL:
        item.analyzedURL,
    });

    setActivePage("analyze");

    if (item.type === "Message") {
      setActiveMode("message");
      setMessage(item.input);
    }

    if (item.type === "Website") {
      setActiveMode("website");
      setUrl(item.input);
    }

    if (item.type === "Screenshot") {
      setActiveMode("image");
      setExtractedText(
        item.extractedText
      );
    }
  };

  // ==================================================
  // AI ASSISTANT
  // ==================================================

  const sendAssistantMessage = async (
    customQuestion = null
  ) => {
    const question = (
      customQuestion ||
      assistantInput
    ).trim();

    if (
      !question ||
      assistantLoading
    ) {
      return;
    }

    // The backend is stateless, so send the conversation so far.
    const conversation = [
      ...assistantMessages,
      { sender: "user", text: question },
    ].map((chat) => ({
      role: chat.sender === "user" ? "user" : "assistant",
      content: chat.text,
    }));

    setAssistantMessages(
      (previousMessages) => [
        ...previousMessages,
        {
          sender: "user",
          text: question,
        },
      ]
    );

    setAssistantInput("");
    setAssistantLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: conversation,
            analysis: result
              ? {
                  trustScore: result.trustScore,
                  riskLevel: result.riskLevel,
                  category: result.category,
                  categoryReason:
                    result.categoryReason || "",
                  indicators: result.indicators || [],
                  recommendation:
                    result.recommendation,
                  content:
                    result.extractedText ||
                    (result.analyzedURL
                      ? url
                      : message) ||
                    "",
                }
              : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "The assistant is unavailable right now."
        );
      }

      setAssistantMessages(
        (previousMessages) => [
          ...previousMessages,
          {
            sender: "ai",
            text:
              data.reply ||
              "I couldn't put an answer together. Try rephrasing the question.",
          },
        ]
      );

      setAssistantSource(
        data.source === "ai" ? "ai" : "offline"
      );
    } catch (error) {
      setAssistantMessages(
        (previousMessages) => [
          ...previousMessages,
          {
            sender: "ai",
            text:
              error.message === "Failed to fetch"
                ? "I can't reach the TrustLens service right now. Make sure the backend is running on port 5000, then try again."
                : error.message,
          },
        ]
      );
    } finally {
      setAssistantLoading(false);
    }
  };

  // ==================================================
  // ASSISTANT ENTER KEY
  // ==================================================

  const handleAssistantKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendAssistantMessage();
    }
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="app">

      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="navbar">

        <div className="brand">

          <div className="brand-icon">
            🛡️
          </div>

          <div>
            <h2>TrustLens</h2>
            <span>
              Digital Trust Analyzer
            </span>
          </div>

        </div>

        <div className="nav-links">

          <button
            className={
              activePage === "analyze"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              setActivePage("analyze")
            }
          >
            Analyze
          </button>

          <button
            className={
              activePage === "history"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              setActivePage("history")
            }
          >
            History
          </button>

          <button
            className={
              activePage === "about"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              setActivePage("about")
            }
          >
            About
          </button>

        </div>

        <button
          className="assistant-nav-button"
          onClick={() =>
            setShowAssistant(true)
          }
        >
          <span>✦</span>
          AI Assistant
        </button>

      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="main-container">

        {/* ==================================================
            HISTORY PAGE
        ================================================== */}

        {activePage === "history" && (

          <section className="history-section">

            <div className="report-header">

              <div>

                <span className="section-label">
                  ANALYSIS HISTORY
                </span>

                <h2>
                  Your Previous Trust Reports
                </h2>

                <p>
                  Review your previous message,
                  website and screenshot analyses.
                </p>

              </div>

              {history.length > 0 && (

                <button
                  className="clear-button"
                  onClick={() =>
                    setHistory([])
                  }
                >
                  Clear History
                </button>

              )}

            </div>

            {history.length === 0 ? (

              <div className="empty-history">

                <div className="empty-history-icon">
                  📋
                </div>

                <h3>
                  No Analysis History
                </h3>

                <p>
                  Your analyzed messages,
                  websites and screenshots
                  will appear here.
                </p>

                <button
                  className="analyze-button"
                  onClick={() =>
                    setActivePage(
                      "analyze"
                    )
                  }
                >
                  Start New Analysis
                </button>

              </div>

            ) : (

              <div className="history-list">

                {history.map(
                  (item) => (

                    <div
                      className="history-card"
                      key={item.id}
                      onClick={() =>
                        openHistoryResult(
                          item
                        )
                      }
                    >

                      <div className="history-card-header">

                        <div>

                          <span className="card-label">
                            {item.type.toUpperCase()} ANALYSIS
                          </span>

                          <h3>
                            {item.category}
                          </h3>

                          <small>
                            {item.date}
                          </small>

                        </div>

                        <div
                          className={`risk-badge ${
                            item.riskLevel?.toLowerCase() ||
                            ""
                          }`}
                        >

                          {item.riskLevel ===
                            "HIGH" &&
                            "🔴"}

                          {item.riskLevel ===
                            "MEDIUM" &&
                            "🟡"}

                          {item.riskLevel ===
                            "LOW" &&
                            "🟢"}

                          {" "}
                          {item.riskLevel} RISK

                        </div>

                      </div>

                      <div className="history-score">

                        <strong>
                          {item.trustScore}
                        </strong>

                        <span>
                          /100 Trust Score
                        </span>

                      </div>

                      <div className="history-input">

                        <strong>
                          Analyzed Content:
                        </strong>

                        <p>

                          {item.input.length >
                          250
                            ? item.input.substring(
                                0,
                                250
                              ) + "..."
                            : item.input}

                        </p>

                      </div>

                      {item.indicators &&
                        item.indicators.length >
                          0 && (

                          <div className="history-indicators">

                            <strong>
                              Detected Indicators:
                            </strong>

                            <ul>

                              {item.indicators.map(
                                (
                                  indicator,
                                  index
                                ) => (

                                  <li
                                    key={
                                      index
                                    }
                                  >
                                    ⚠️{" "}
                                    {indicator}
                                  </li>

                                )
                              )}

                            </ul>

                          </div>

                        )}

                      <div className="history-recommendation">

                        <strong>
                          Recommended Action:
                        </strong>

                        <p>
                          {
                            item.recommendation
                          }
                        </p>

                      </div>

                      <button
                        className="history-view-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openHistoryResult(
                            item
                          );
                        }}
                      >
                        View Full Report →
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}

        {/* ==================================================
            ABOUT PAGE
        ================================================== */}

        {activePage === "about" && (

          <section className="about-section">

            <div className="status-badge">

              <span className="status-dot"></span>

              About TrustLens

            </div>

            <h1>

              Digital safety,

              <br />

              <span>
                made understandable.
              </span>

            </h1>

            <p>

              TrustLens is a digital trust
              analyzer designed to help users
              identify suspicious messages,
              websites and screenshots.

            </p>

            <div className="about-grid">

              <div className="category-card">

                <div className="category-icon">
                  📧
                </div>

                <h3>
                  Message Analysis
                </h3>

                <p>

                  Detect phishing, job scams,
                  banking scams, investment scams
                  and other suspicious patterns.

                </p>

              </div>

              <div className="category-card">

                <div className="category-icon">
                  🌐
                </div>

                <h3>
                  Website Analysis
                </h3>

                <p>

                  Check URLs for suspicious
                  domains, shorteners, IP addresses
                  and other risk indicators.

                </p>

              </div>

              <div className="category-card">

                <div className="category-icon">
                  📷
                </div>

                <h3>
                  Screenshot Analysis
                </h3>

                <p>

                  Extract text from screenshots
                  using OCR and analyze the
                  detected content.

                </p>

              </div>

              <div className="category-card">

                <div className="category-icon">
                  ✦
                </div>

                <h3>
                  Hardcoded Safety Assistant
                </h3>

                <p>

                  Get instant answers about
                  phishing, scams, passwords,
                  OTP safety and online security.

                </p>

              </div>

            </div>

            <button
              className="analyze-button"
              onClick={() =>
                setActivePage("analyze")
              }
            >
              Start Analysis
            </button>

          </section>

        )}

        {/* ==================================================
            ANALYZE PAGE
        ================================================== */}

        {activePage === "analyze" && (

          <>

            {/* ==================================================
                HERO
            ================================================== */}

            <section className="hero-section">

              <div className="status-badge">

                <span className="status-dot"></span>

                Digital Safety Analyzer

              </div>

              <h1>

                See the risk.

                <br />

                <span>
                  Understand the threat.
                </span>

              </h1>

              <p>

                Analyze suspicious messages,
                websites and screenshots with
                TrustLens. Get clear explanations
                and practical safety recommendations
                before you take action.

              </p>

            </section>

            {/* ==================================================
                ANALYZER CARD
            ================================================== */}

            <section className="analyzer-card">

              <div className="mode-selector">

                <button
                  className={
                    activeMode === "message"
                      ? "mode-button active-mode"
                      : "mode-button"
                  }
                  onClick={() =>
                    setActiveMode(
                      "message"
                    )
                  }
                >

                  <span className="mode-icon">
                    📧
                  </span>

                  <div>

                    <strong>
                      Message
                    </strong>

                    <small>
                      Email, SMS, WhatsApp
                    </small>

                  </div>

                </button>

                <button
                  className={
                    activeMode === "website"
                      ? "mode-button active-mode"
                      : "mode-button"
                  }
                  onClick={() =>
                    setActiveMode(
                      "website"
                    )
                  }
                >

                  <span className="mode-icon">
                    🌐
                  </span>

                  <div>

                    <strong>
                      Website
                    </strong>

                    <small>
                      Analyze a URL
                    </small>

                  </div>

                </button>

                <button
                  className={
                    activeMode === "image"
                      ? "mode-button active-mode"
                      : "mode-button"
                  }
                  onClick={() =>
                    setActiveMode(
                      "image"
                    )
                  }
                >

                  <span className="mode-icon">
                    📷
                  </span>

                  <div>

                    <strong>
                      Screenshot
                    </strong>

                    <small>
                      Scan an image
                    </small>

                  </div>

                </button>

              </div>

              <div className="input-section">

                {/* ==================================================
                    MESSAGE MODE
                ================================================== */}

                {activeMode === "message" && (

                  <>

                    <div className="input-header">

                      <div>

                        <h3>
                          Analyze a suspicious message
                        </h3>

                        <p>

                          Paste an email, SMS,
                          WhatsApp message, job offer
                          or suspicious content.

                        </p>

                      </div>

                      <span className="secure-label">
                        🔒 Private Analysis
                      </span>

                    </div>

                    <textarea
                      value={message}
                      onChange={(e) =>
                        setMessage(
                          e.target.value
                        )
                      }
                      placeholder="Paste the suspicious message here..."
                    />

                    <div className="input-footer">

                      <span>
                        {message.length} characters
                      </span>

                      <button
                        className="analyze-button"
                        onClick={
                          analyzeMessage
                        }
                        disabled={
                          loading ||
                          !message.trim()
                        }
                      >

                        {loading ? (

                          <>

                            <span className="spinner"></span>

                            Analyzing...

                          </>

                        ) : (

                          <>
                            🔍 Analyze with TrustLens
                          </>

                        )}

                      </button>

                    </div>

                  </>

                )}

                {/* ==================================================
                    WEBSITE MODE
                ================================================== */}

                {activeMode === "website" && (

                  <>

                    <div className="input-header">

                      <div>

                        <h3>
                          Analyze a suspicious website
                        </h3>

                        <p>

                          Enter a website URL and
                          TrustLens will check for
                          suspicious URL indicators.

                        </p>

                      </div>

                      <span className="secure-label">
                        🔒 Safe URL Analysis
                      </span>

                    </div>

                    <div className="url-input-wrapper">

                      <span className="url-icon">
                        🌐
                      </span>

                      <input
                        type="text"
                        value={url}
                        onChange={(e) =>
                          setUrl(
                            e.target.value
                          )
                        }
                        placeholder="https://example.com"
                      />

                    </div>

                    <div className="input-footer">

                      <span>
                        URL structure analysis
                      </span>

                      <button
                        className="analyze-button"
                        onClick={
                          analyzeURL
                        }
                        disabled={
                          urlLoading ||
                          !url.trim()
                        }
                      >

                        {urlLoading ? (

                          <>

                            <span className="spinner"></span>

                            Analyzing URL...

                          </>

                        ) : (

                          <>
                            🔍 Analyze Website
                          </>

                        )}

                      </button>

                    </div>

                  </>

                )}

                {/* ==================================================
                    SCREENSHOT MODE
                ================================================== */}

                {activeMode === "image" && (

                  <>

                    <div className="input-header">

                      <div>

                        <h3>
                          Analyze a suspicious screenshot
                        </h3>

                        <p>

                          Upload a screenshot of a
                          suspicious SMS, email,
                          WhatsApp message or scam.

                        </p>

                      </div>

                      <span className="secure-label">
                        🔒 OCR Analysis
                      </span>

                    </div>

                    <label className="screenshot-upload">

                      {!imagePreview ? (

                        <>

                          <div className="upload-icon">
                            📷
                          </div>

                          <h3>
                            Upload Screenshot
                          </h3>

                          <p>
                            Click here to select an image
                          </p>

                          <small>
                            PNG, JPG or JPEG • Max 10 MB
                          </small>

                        </>

                      ) : (

                        <div className="image-preview-container">

                          <img
                            src={imagePreview}
                            alt="Selected screenshot"
                            className="image-preview"
                          />

                        </div>

                      )}

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={
                          handleImageSelect
                        }
                        hidden
                      />

                    </label>

                    {ocrLoading && (

                      <div className="ocr-progress">

                        <div>

                          <span>
                            🔍 Reading screenshot...
                          </span>

                          <strong>
                            {ocrProgress}%
                          </strong>

                        </div>

                        <div className="progress-bar">

                          <div
                            className="progress-fill"
                            style={{
                              width: `${ocrProgress}%`,
                            }}
                          />

                        </div>

                      </div>

                    )}

                    {extractedText && (

                      <div className="extracted-text-card">

                        <span className="card-label">
                          EXTRACTED TEXT
                        </span>

                        <p>
                          {extractedText}
                        </p>

                      </div>

                    )}

                    <div className="input-footer">

                      <span>

                        {selectedImage
                          ? selectedImage.name
                          : "No screenshot selected"}

                      </span>

                      <button
                        className="analyze-button"
                        onClick={
                          analyzeScreenshot
                        }
                        disabled={
                          ocrLoading ||
                          !selectedImage
                        }
                      >

                        {ocrLoading ? (

                          <>

                            <span className="spinner"></span>

                            Scanning Screenshot...

                          </>

                        ) : (

                          <>
                            🔍 Scan Screenshot
                          </>

                        )}

                      </button>

                    </div>

                  </>

                )}

              </div>

            </section>

            {/* ==================================================
                TRUST REPORT
            ================================================== */}

            {result && (

              <section className="report-section">

                <div className="report-header">

                  <div>

                    <span className="section-label">
                      ANALYSIS COMPLETE
                    </span>

                    <h2>
                      Your Trust Report
                    </h2>

                    {result.sourceType && (

                      <small>
                        Source:{" "}
                        {result.sourceType}
                      </small>

                    )}

                  </div>

                  <button
                    className="clear-button"
                    onClick={
                      clearAnalysis
                    }
                  >
                    New Analysis
                  </button>

                </div>

                <div className="report-grid">

                  <div className="score-card">

                    <span className="card-label">
                      TRUST SCORE
                    </span>

                    <div
                      className="score-circle"
                      style={{
                        "--score-progress": `${
                          Math.max(
                            0,
                            Math.min(
                              100,
                              Number(result.trustScore) || 0
                            )
                          ) * 3.6
                        }deg`,
                        "--score-color":
                          RISK_COLORS[result.riskLevel] || "#4ade80",
                      }}
                    >

                      <div>

                        <strong>
                          {result.trustScore}
                        </strong>

                        <span>
                          /100
                        </span>

                      </div>

                    </div>

                    <div
                      className={`risk-badge ${
                        result.riskLevel?.toLowerCase() ||
                        ""
                      }`}
                    >

                      {result.riskLevel ===
                        "HIGH" &&
                        "🔴"}

                      {result.riskLevel ===
                        "MEDIUM" &&
                        "🟡"}

                      {result.riskLevel ===
                        "LOW" &&
                        "🟢"}

                      {" "}
                      {result.riskLevel} RISK

                    </div>

                  </div>

                  <div className="category-card">

                    <span className="card-label">
                      DETECTED CATEGORY
                    </span>

                    <div className="category-icon">
                      {result.riskLevel === "LOW" ? "✅" : "⚠️"}
                    </div>

                    <h3>
                      {result.category}
                    </h3>

                    <p>
                      {result.categoryReason ||
                        "TrustLens matched a pattern that may indicate unsafe content."}
                    </p>

                  </div>

                  <div className="indicators-card">

                    <span className="card-label">
                      RISK INDICATORS
                    </span>

                    <div className="indicator-list">

                      {result.indicators &&
                      result.indicators.length >
                        0 ? (

                        result.indicators.map(
                          (
                            indicator,
                            index
                          ) => (

                            <div
                              className="indicator"
                              key={
                                index
                              }
                            >

                              <span>
                                ⚠️
                              </span>

                              <p>
                                {indicator}
                              </p>

                            </div>

                          )
                        )

                      ) : (

                        <div className="safe-message">

                          <span>
                            ✓
                          </span>

                          <p>
                            No major suspicious
                            indicators detected.
                          </p>

                        </div>

                      )}

                    </div>

                  </div>

                </div>

                <div className="recommendation-card">

                  <div className="recommendation-icon">
                    🛡️
                  </div>

                  <div>

                    <span className="card-label">
                      RECOMMENDED ACTION
                    </span>

                    <p>
                      {result.recommendation}
                    </p>

                  </div>

                </div>

                {result.extractedText && (

                  <div className="extracted-text-card">

                    <span className="card-label">
                      ANALYSIS EVIDENCE
                    </span>

                    <p>
                      {result.extractedText}
                    </p>

                  </div>

                )}

                {/* ==================================================
                    ASSISTANT CTA
                ================================================== */}

                <div className="assistant-cta">

                  <div className="assistant-avatar">
                    ✦
                  </div>

                  <div className="assistant-text">

                    <h3>
                      Need help understanding this result?
                    </h3>

                    <p>

                      Ask the TrustLens Safety
                      Assistant about the threat,
                      next steps or how to stay safe.

                    </p>

                  </div>

                  <button
                    className="ask-button"
                    onClick={() =>
                      setShowAssistant(
                        true
                      )
                    }
                  >
                    Ask TrustLens Assistant →
                  </button>

                </div>

              </section>

            )}

          </>

        )}

      </main>

      {/* ==================================================
          FLOATING ASSISTANT BUTTON
      ================================================== */}

      {!showAssistant && (

        <button
          className="floating-assistant"
          onClick={() =>
            setShowAssistant(
              true
            )
          }
        >

          <span>
            ✦
          </span>

          <div>

            <strong>
              TrustLens AI
            </strong>

            <small>
              Ask me anything
            </small>

          </div>

        </button>

      )}

      {/* ==================================================
          AI ASSISTANT PANEL
      ================================================== */}

      {showAssistant && (

        <div className="assistant-panel">

          <div className="assistant-header">

            <div className="assistant-profile">

              <div className="assistant-avatar">
                ✦
              </div>

              <div>

                <strong>
                  TrustLens AI
                </strong>

                <span>
                  {assistantSource === "offline"
                    ? "Offline safety guide"
                    : "Digital Safety Assistant"}
                </span>

              </div>

            </div>

            <button
              className="close-assistant"
              onClick={() =>
                setShowAssistant(
                  false
                )
              }
            >
              ×
            </button>

          </div>

          <div className="assistant-messages">

            {assistantMessages.map(
              (chat, index) => (

                <div
                  key={index}
                  className={
                    chat.sender === "user"
                      ? "user-message"
                      : "ai-message"
                  }
                >

                  {chat.sender === "ai" && (

                    <div className="message-icon">
                      ✦
                    </div>

                  )}

                  <div>

                    <p>
                      {chat.text}
                    </p>

                  </div>

                </div>

              )
            )}

            {assistantLoading && (

              <div className="ai-message">

                <div className="message-icon">
                  ✦
                </div>

                <div className="typing-indicator">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            )}

          </div>

          <div className="assistant-suggestions">

            <button
              onClick={() =>
                sendAssistantMessage(
                  "What is phishing?"
                )
              }
              disabled={
                assistantLoading
              }
            >
              What is phishing?
            </button>

            <button
              onClick={() =>
                sendAssistantMessage(
                  "What should I do?"
                )
              }
              disabled={
                assistantLoading
              }
            >
              What should I do?
            </button>

            <button
              onClick={() =>
                sendAssistantMessage(
                  "How can I verify this?"
                )
              }
              disabled={
                assistantLoading
              }
            >
              How can I verify this?
            </button>

          </div>

          <div className="assistant-input">

            <input
              type="text"
              value={assistantInput}
              onChange={(e) =>
                setAssistantInput(
                  e.target.value
                )
              }
              onKeyDown={
                handleAssistantKeyDown
              }
              placeholder="Ask TrustLens AI..."
              disabled={
                assistantLoading
              }
            />

            <button
              onClick={() =>
                sendAssistantMessage()
              }
              disabled={
                assistantLoading ||
                !assistantInput.trim()
              }
            >
              ↑
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;