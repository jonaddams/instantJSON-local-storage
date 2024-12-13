"use client";
import { useEffect, useRef, useState } from "react";

export default () => {
  const containerRef = useRef(null);
  const [jsonItems, setJsonItems] = useState([]);
  const [instantJSON, setInstantJSON] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const formatTimestamp = (timestamp) => {
    return timestamp;
  };

  const downloadJSON = (jsonData) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const key = `pspdfkit-instant-json-${timestamp}`;
    localStorage.setItem(key, JSON.stringify(jsonData, null, 2));
    setJsonItems([...jsonItems, key]);
  };

  const exportToolbarButton = {
    type: "custom",
    id: "export",
    title: "Export Instant JSON",
    onPress: async (event) => {
      let iJSON = await window.instance.exportInstantJSON();
      downloadJSON(iJSON);
    },
  };

  useEffect(() => {
    const container = containerRef.current;

    if (container && typeof window !== "undefined") {
      import("pspdfkit").then((PSPDFKit) => {
        if (PSPDFKit) {
          PSPDFKit.unload(container);
        }

        PSPDFKit.load({
          container,
          document: "/blank.pdf",
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
          toolbarItems: [...PSPDFKit.defaultToolbarItems, exportToolbarButton],
          instantJSON: instantJSON,
        }).then((instance) => {
          window.instance = instance;
        });
      });

      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith("pspdfkit-instant-json-"))
        .sort();
      setJsonItems(keys);
    }
  }, [instantJSON]);

  const handleItemClick = (key) => {
    const jsonData = localStorage.getItem(key);
    setInstantJSON(JSON.parse(jsonData));
    setSelectedItem(key);
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-1/4 bg-gray-200 p-4">
        <nav>
          <h2 className="text-lg font-bold mb-2">Instant JSON Versions</h2>
          <ul className="space-y-4">
            {jsonItems.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className={`text-blue-500 hover:underline ${selectedItem === item ? "font-bold text-red-700" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  {formatTimestamp(item.replace("pspdfkit-instant-json-", ""))}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="w-3/4 p-8">
        <div id="pspdfkit" ref={containerRef} className="w-full h-screen"></div>
      </main>
    </div>
  );
};
