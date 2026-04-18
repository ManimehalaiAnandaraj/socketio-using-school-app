import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider, theme as antTheme } from "antd";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  const getInitialTheme = () => {
    return localStorage.getItem("theme") || "light";
  };

  const [theme, setTheme] = useState(getInitialTheme());

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: isDark ? "#3b82f6" : "#2563eb",
            colorBgContainer: isDark ? "#0f172a" : "#ffffff",
            colorBgElevated: isDark ? "#0f172a" : "#ffffff",
            colorBgBase: isDark ? "#020617" : "#f1f5f9",
            colorBorder: isDark ? "#1e293b" : "#e2e8f0",
            colorText: isDark ? "#e2e8f0" : "#0f172a",
            colorTextPlaceholder: isDark ? "#94a3b8" : "#64748b",
            colorTextLabel: isDark ? "#e2e8f0" : "#0f172a",
            colorFillAlter: isDark ? "#0f172a" : "#f1f5f9",
            colorSplit: isDark ? "#1e293b" : "#e2e8f0",
            borderRadius: 6,
          },
          components: {
            Select: {
              optionSelectedBg: isDark ? "#3b82f6" : "#2563eb",
              optionSelectedColor: "#ffffff",
              optionActiveBg: isDark ? "#1e293b" : "#d7d9da",
            },
            Modal: {
              contentBg: isDark ? "#0f172a" : "#ffffff",
              headerBg: isDark ? "#0f172a" : "#ffffff",
              titleColor: isDark ? "#e2e8f0" : "#0f172a",
            },
            Table: {
              headerBg: isDark ? "#3b82f6" : "#2563eb",
              headerColor: isDark ? "#e2e8f0" : "#0f172a",
              rowHoverBg: isDark ? "#1e293b" : "#d7d9da",
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};