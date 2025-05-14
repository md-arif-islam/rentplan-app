import rollupReplace from "@rollup/plugin-replace";
import react from "@vitejs/plugin-react";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const config = {
        resolve: {
            alias: [
                {
                    find: "@",
                    replacement: path.resolve(__dirname, "./src"),
                },
            ],
        },
        plugins: [
            rollupReplace({
                preventAssignment: true,
                values: {
                    __DEV__: JSON.stringify(true),
                    "process.env.NODE_ENV": JSON.stringify(mode),
                },
            }),
            react(),
            reactRefresh(),
        ],
    };

    if (mode === "production") {
        // Production-specific config
        config.base = "/dist/";
        config.build = {
            outDir: "../public/dist",
            emptyOutDir: true,
        };
        config.server = {
            host: true,
        };
    }

    return config;
});
