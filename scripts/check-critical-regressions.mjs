import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appSource = readFileSync(resolve("src/App.tsx"), "utf8");

const requiredPatterns = [
  [/const \[step, setStep\] = useState<AppStep>\('landing'\);/, "App starts on the landing step"],
  [/const \[selectedTheme, setSelectedTheme\] = useState<LifeTheme \| null>\(null\);/, "App starts without a selected theme"],
  [/const \[result, setResult\] = useState<SimulationResult \| null>\(null\);/, "App starts without a preloaded result"],
  [/const \[isPaid, setIsPaid\] = useState\(false\);/, "App starts in the unpaid state"],
];

const forbiddenSnippets = [
  "MOCK_RESULT",
  "Mock Mode",
  "Using Mock Result",
  "useState<AppStep>('result')",
];

for (const [pattern, description] of requiredPatterns) {
  if (!pattern.test(appSource)) {
    throw new Error(`Missing critical App default: ${description}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (appSource.includes(snippet)) {
    throw new Error(`Forbidden production mock/demo path found: ${snippet}`);
  }
}

console.log("Critical regression checks passed.");
