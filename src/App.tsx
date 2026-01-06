// App.tsx
import { useEffect, useRef, useState } from "react";

const imageModules = import.meta.glob(
  "/public/images/*.{jpg,jpeg,png}",
  { eager: true }
);

const images = Object.entries(imageModules)
  .sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  )
  .map(([, m]: any) => m.default);

function App() {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const scrollY = useRef(0);

  // Save scroll + open preview
  const openImage = (src: string) => {
    scrollY.current = window.scrollY;
    setActiveImage(src);
    document.body.style.overflow = "hidden";
  };

  // Close preview + restore scroll
  const closeImage = () => {
    setActiveImage(null);
    document.body.style.overflow = "";
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY.current);
    });
  };

  // ESC support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Gallery */}
      <main style={styles.page}>
        <div style={styles.gallery}>
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              loading="lazy"
              style={styles.image}
              onClick={() => openImage(src)}
            />
          ))}
        </div>
      </main>

      {/* Fullscreen preview */}
      {activeImage && (
        <div
          style={styles.overlay}
          onClick={closeImage}   // 👈 click anywhere to close
        >
          <button
            style={styles.backButton}
            onClick={(e) => {
              e.stopPropagation();
              closeImage();
            }}
          >
            ← Back
          </button>

          <img
            src={activeImage}
            style={styles.fullImage}
            onClick={(e) => e.stopPropagation()} // 👈 prevent close on image tap
          />
        </div>
      )}
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    padding: "12px",
  },
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
    display: "block",
    cursor: "zoom-in",
  },

  // Overlay viewer
  overlay: {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    cursor: "zoom-out",
  },
  fullImage: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    objectFit: "contain" as const,
    borderRadius: "8px",
  },
  backButton: {
    position: "absolute" as const,
    top: "16px",
    left: "16px",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default App;
