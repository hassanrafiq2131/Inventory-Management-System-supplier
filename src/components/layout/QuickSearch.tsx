import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const QuickSearch = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const filteredItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault(); // Prevent default browser search bar
        setIsOpen((prev) => !prev); // Toggle the modal
      }

      if (isOpen) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex < filteredItems.length - 1 ? prevIndex + 1 : 0
          );
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : filteredItems.length - 1
          );
        } else if (event.key === "Enter") {
          event.preventDefault();
          handleNavigate(filteredItems[selectedIndex]?.path);
        } else if (event.key === "Escape") {
          setIsOpen(false);
        } else if (!event.ctrlKey && event.key.length === 1) {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedIndex, filteredItems]);

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
      setIsOpen(false); // Close the modal after navigation
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div
        className="w-full max-w-3xl p-6 bg-white/20 backdrop-blur-md shadow-lg rounded-lg relative"
        style={{
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <input
          type="text"
          placeholder="Quick Navigation... (ESC to close)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 mb-4 text-lg bg-transparent border border-gray-300 rounded-md text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ref={inputRef}
        />
        <ul className="max-h-60 overflow-y-auto hide-scrollbar">
          {filteredItems.map((item, index) => (
            <li
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`px-4 py-3 rounded-md cursor-pointer text-gray-50 ${
                index === selectedIndex
                  ? "bg-blue-500 text-white"
                  : "hover:bg-blue-300/20"
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {item.label}
            </li>
          ))}
          {filteredItems.length === 0 && (
            <li className="px-4 py-3 text-gray-400">No matching results</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default QuickSearch;
