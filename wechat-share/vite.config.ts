import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import packageJson from './package.json';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    ViteYaml(),
  ],
  build: {
    lib: {
      entry: 'index.ts',
      name: packageJson.name,
      fileName: (format) => `${packageJson.name}.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-bootstrap', 'react-bootstrap', 'react-i18next'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-i18next': 'ReactI18next',
          'react-bootstrap': 'ReactBootstrap',
        },
      },
    }
  },
});
