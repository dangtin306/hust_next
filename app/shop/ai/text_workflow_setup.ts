import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

const resolveSetupPath = () => {
  const candidates = [
    path.join(process.cwd(), "src", "content", "orders", "text_workflow_setup.mdx"),
    path.join(process.cwd(), "hust_next", "src", "content", "orders", "text_workflow_setup.mdx"),
    path.join(process.cwd(), "..", "hust_next", "src", "content", "orders", "text_workflow_setup.mdx"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  return candidates[0];
};

const stripFrontmatter = (source: string) => {
  const lines = source.split(/\r?\n/);
  if (lines.length < 3 || lines[0].trim() !== "---") return source.trim();

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      return lines.slice(i + 1).join("\n").trim();
    }
  }

  return source.trim();
};

export async function getTextWorkflowSetup() {
  try {
    const source = await readFile(resolveSetupPath(), "utf8");
    return stripFrontmatter(source);
  } catch {
    return "";
  }
}
