import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // RFC4180-ish
  if (/[\n\r",]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function arrayToCsvCell(arr?: unknown[]): string {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.map((v) => String(v)).join("; ");
}

function generateWhoMeridianExports(): Plugin {
  return {
    name: "generate-who-meridian-exports",
    async buildStart() {
      try {
        const exportsDir = path.resolve(__dirname, "./public/exports");
        await mkdir(exportsDir, { recursive: true });

        // Import the in-repo database (pure data, safe to load in Node during build)
        const meridianModuleUrl = pathToFileURL(
          path.resolve(__dirname, "./src/utils/meridianPoints/index.ts")
        ).href;
        const meridianModule: any = await import(meridianModuleUrl);
        const points: any[] = meridianModule.COMPLETE_ACUPUNCTURE_DATABASE;

        if (!Array.isArray(points) || points.length === 0) {
          this.warn(
            "WHO export generation skipped: COMPLETE_ACUPUNCTURE_DATABASE is empty or not an array."
          );
          return;
        }

        const jsonPath = path.join(exportsDir, "who-meridian-points.json");
        await writeFile(jsonPath, JSON.stringify(points, null, 2), "utf8");

        const headers = [
          "id",
          "nameChinese",
          "nameEnglish",
          "nameGerman",
          "meridian",
          "element",
          "location",
          "depth",
          "frequency",
          "harmonicFrequencies",
          "pointTypes",
          "functions",
          "indications",
          "precautions",
          "chakraCorrespondence",
        ];

        const csvLines: string[] = [];
        csvLines.push(headers.join(","));
        for (const p of points) {
          csvLines.push(
            [
              escapeCsv(p.id),
              escapeCsv(p.nameChinese),
              escapeCsv(p.nameEnglish),
              escapeCsv(p.nameGerman),
              escapeCsv(p.meridian),
              escapeCsv(p.element),
              escapeCsv(p.location),
              escapeCsv(p.depth),
              escapeCsv(p.frequency),
              escapeCsv(arrayToCsvCell(p.harmonicFrequencies)),
              escapeCsv(arrayToCsvCell(p.pointTypes)),
              escapeCsv(arrayToCsvCell(p.functions)),
              escapeCsv(arrayToCsvCell(p.indications)),
              escapeCsv(arrayToCsvCell(p.precautions)),
              escapeCsv(p.chakraCorrespondence),
            ].join(",")
          );
        }

        const csvPath = path.join(exportsDir, "who-meridian-points.csv");
        await writeFile(csvPath, csvLines.join("\n"), "utf8");

        this.info(
          `Generated WHO meridian exports: ${path.relative(
            __dirname,
            jsonPath
          )} and ${path.relative(__dirname, csvPath)} (${points.length} points)`
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.warn(
          `WHO export generation failed (non-fatal): ${message}. The app will still run.`
        );
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [generateWhoMeridianExports(), react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
