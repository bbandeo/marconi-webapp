This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where comments have been removed, line numbers have been added, content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/**/*.js, docs/**/*.md, *.md, *.json, src/**/*.cjs
- Files matching these patterns are excluded: src/core/database/seeders/**, node_modules/**, data/**, public/**, test/**, *.log, coverage/**, dist/**, build/**, **/*.xlsx, **/*.csv, **/.DS_Store, **/*.tmp, **/*.lock, package-lock.json, **/*.svg, **/*.jpg, **/*.jpeg, **/*.png, **/*.gif, **/*.bmp, **/*.tiff, **/*.tif, **/*.webp, **/*.ico, **/*.avif, **/*.heic, **/*.heif, **/*.mp4, **/*.avi, **/*.mov, **/*.wmv, **/*.flv, **/*.webm, **/*.mkv, **/*.m4v, **/*.3gp, **/*.mpeg, **/*.mpg, **/*.ogv, **/*.ts, **/*.m3u8, **/*.mp3, **/*.wav, **/*.flac, **/*.aac, **/*.ogg, **/*.wma, **/*.m4a, **/*.md
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Line numbers have been added to the beginning of each line
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
components.json
package.json
tsconfig.json
```

# Files

## File: components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## File: package.json
```json
{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev -H 0.0.0.0 -p 5000",
    "lint": "next lint",
    "local": "next dev",
    "start": "next start"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@emotion/is-prop-valid": "latest",
    "@hookform/resolvers": "latest",
    "@radix-ui/react-accordion": "latest",
    "@radix-ui/react-alert-dialog": "latest",
    "@radix-ui/react-aspect-ratio": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-checkbox": "latest",
    "@radix-ui/react-collapsible": "latest",
    "@radix-ui/react-context-menu": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-hover-card": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-menubar": "latest",
    "@radix-ui/react-navigation-menu": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-radio-group": "latest",
    "@radix-ui/react-scroll-area": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-slider": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",
    "@radix-ui/react-toggle": "latest",
    "@radix-ui/react-toggle-group": "latest",
    "@radix-ui/react-tooltip": "latest",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/supabase-js": "latest",
    "autoprefixer": "^10.4.20",
    "class-variance-authority": "^0.7.1",
    "cloudinary": "latest",
    "clsx": "^2.1.1",
    "cmdk": "latest",
    "date-fns": "4.1.0",
    "embla-carousel": "^8.6.0",
    "embla-carousel-autoplay": "^8.6.0",
    "embla-carousel-react": "latest",
    "framer-motion": "latest",
    "input-otp": "latest",
    "leaflet": "^1.9.4",
    "leaflet-defaulticon-compatibility": "^0.1.2",
    "lucide-react": "^0.454.0",
    "next": "15.2.4",
    "next-themes": "latest",
    "react": "^19",
    "react-day-picker": "latest",
    "react-dom": "^19",
    "react-hook-form": "latest",
    "react-leaflet": "^5.0.0",
    "react-resizable-panels": "latest",
    "recharts": "latest",
    "sonner": "latest",
    "tailwind-merge": "^2.5.5",
    "tailwindcss": "^3.3.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "latest",
    "zod": "^4.0.5"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.20",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.3",
    "postcss": "^8.5",
    "typescript": "^5"
  }
}
```
