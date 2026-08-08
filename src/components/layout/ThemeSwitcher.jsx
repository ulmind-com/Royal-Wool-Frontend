import { useState } from "react";
import "./theme-switcher.css";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5a8.8 8.8 0 1 0 10.7 10.7Z" />
  </svg>
);

const DimIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 15.5h16M6 11.5h12M8 7.5h8" />
    <path d="M12 2v3M7.05 4.05l2.12 2.12M16.95 4.05l-2.12 2.12" />
    <path d="M5 18.5h14M8 21h8" />
  </svg>
);

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  const options = [
    {
      value: "light",
      icon: <SunIcon />,
    },
    {
      value: "dark",
      icon: <MoonIcon />,
    },
    {
      value: "dim",
      icon: <DimIcon />,
    },
  ];

  return (
    <div className={`theme-switcher theme-${theme}`}>
      <div className="theme-switcher__glass-filter" />

      <div className="theme-switcher__options">
        {options.map((option) => (
          <label
            key={option.value}
            className={`theme-switcher__option ${
              theme === option.value ? "is-active" : ""
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={theme === option.value}
              onChange={() => setTheme(option.value)}
            />

            <span className="theme-switcher__icon">
              {option.icon}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
