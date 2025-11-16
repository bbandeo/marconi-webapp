#!/usr/bin/env node
/**
 * Utilidad para leer el archivo ANALYTICS.md creado en el último commit
 * Este script permite acceder y mostrar el contenido del README de analytics
 * creado en el commit af7af7de771b44aa0696ac651bada12d20fc9e84
 */

const fs = require('fs');
const path = require('path');

class AnalyticsReadmeReader {
  constructor() {
    this.readmePath = path.join(__dirname, '..', 'ANALYTICS.md');
    this.commitHash = 'af7af7de771b44aa0696ac651bada12d20fc9e84';
  }

  /**
   * Lee el contenido completo del README de analytics
   */
  readFullContent() {
    try {
      const content = fs.readFileSync(this.readmePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error leyendo ANALYTICS.md:', error.message);
      return null;
    }
  }

  /**
   * Extrae una sección específica del README
   * @param {string} sectionName - Nombre de la sección (ej: "Quick Start", "API Endpoints")
   */
  readSection(sectionName) {
    const content = this.readFullContent();
    if (!content) return null;

    const lines = content.split('\n');
    const sectionRegex = new RegExp(`^##.*${sectionName}`, 'i');
    
    let sectionStart = -1;
    let sectionEnd = -1;

    // Buscar inicio de la sección
    for (let i = 0; i < lines.length; i++) {
      if (sectionRegex.test(lines[i])) {
        sectionStart = i;
        break;
      }
    }

    if (sectionStart === -1) {
      console.log(`Sección "${sectionName}" no encontrada`);
      return null;
    }

    // Buscar final de la sección (próximo ##)
    for (let i = sectionStart + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        sectionEnd = i;
        break;
      }
    }

    const sectionLines = lines.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);
    return sectionLines.join('\n');
  }

  /**
   * Lista todas las secciones disponibles
   */
  listSections() {
    const content = this.readFullContent();
    if (!content) return [];

    const sections = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.startsWith('## ')) {
        const sectionName = line.replace('## ', '').replace(/^[🚀📊🛠️🛡️🚀🔧🔍📚🎯📞📄]+ /, '');
        sections.push(sectionName);
      }
    }

    return sections;
  }

  /**
   * Busca texto específico en el README
   * @param {string} searchTerm - Término a buscar
   */
  search(searchTerm) {
    const content = this.readFullContent();
    if (!content) return [];

    const lines = content.split('\n');
    const results = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          line: i + 1,
          content: lines[i].trim(),
          context: lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2))
        });
      }
    }

    return results;
  }

  /**
   * Extrae todos los endpoints de la API
   */
  extractApiEndpoints() {
    const apiSection = this.readSection('API Endpoints');
    if (!apiSection) return [];

    const endpoints = [];
    const lines = apiSection.split('\n');

    for (const line of lines) {
      // Buscar líneas que contengan métodos HTTP y rutas
      const httpMethodRegex = /(GET|POST|PUT|DELETE|PATCH)\s+([/\w\-\[\]:?={}]+)/g;
      let match;

      while ((match = httpMethodRegex.exec(line)) !== null) {
        endpoints.push({
          method: match[1],
          path: match[2],
          description: line.replace(match[0], '').replace(/[#`]/g, '').trim()
        });
      }
    }

    return endpoints;
  }

  /**
   * Muestra información sobre el commit que creó el README
   */
  getCommitInfo() {
    return {
      hash: this.commitHash,
      date: 'Sat Aug 23 18:00:55 2025 -0300',
      author: 'bbandeo <bbandeo@crosetto.com.ar>',
      message: 'Implement comprehensive analytics tracking system',
      filesCreated: [
        'ANALYTICS.md',
        'app/admin/analytics/page.tsx',
        'app/api/analytics/dashboard/route.ts',
        'components/admin/AnalyticsDashboard.tsx',
        'services/analytics.ts',
        'types/analytics.ts'
      ]
    };
  }

  /**
   * Función principal para usar desde línea de comandos
   */
  cli() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'full':
        console.log(this.readFullContent());
        break;
      
      case 'section':
        const sectionName = args[1];
        if (!sectionName) {
          console.log('Uso: node read-analytics-readme.js section "Nombre de Sección"');
          return;
        }
        console.log(this.readSection(sectionName));
        break;
      
      case 'sections':
        console.log('Secciones disponibles:');
        this.listSections().forEach((section, index) => {
          console.log(`${index + 1}. ${section}`);
        });
        break;
      
      case 'search':
        const searchTerm = args[1];
        if (!searchTerm) {
          console.log('Uso: node read-analytics-readme.js search "término"');
          return;
        }
        const results = this.search(searchTerm);
        console.log(`Encontradas ${results.length} coincidencias para "${searchTerm}":`);
        results.forEach(result => {
          console.log(`Línea ${result.line}: ${result.content}`);
        });
        break;
      
      case 'endpoints':
        const endpoints = this.extractApiEndpoints();
        console.log('Endpoints de la API:');
        endpoints.forEach(endpoint => {
          console.log(`${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
        });
        break;
      
      case 'info':
        const info = this.getCommitInfo();
        console.log('Información del commit:');
        console.log(`Hash: ${info.hash}`);
        console.log(`Fecha: ${info.date}`);
        console.log(`Autor: ${info.author}`);
        console.log(`Mensaje: ${info.message}`);
        console.log('Archivos creados:', info.filesCreated.join(', '));
        break;
      
      default:
        console.log(`
Utilidad para leer ANALYTICS.md del último commit

Uso:
  node read-analytics-readme.js full                    # Mostrar contenido completo
  node read-analytics-readme.js section "Quick Start"  # Mostrar sección específica
  node read-analytics-readme.js sections               # Listar todas las secciones
  node read-analytics-readme.js search "GDPR"          # Buscar término
  node read-analytics-readme.js endpoints              # Listar endpoints de API
  node read-analytics-readme.js info                   # Info del commit

Ejemplos:
  node read-analytics-readme.js section "API Endpoints"
  node read-analytics-readme.js search "privacy"
  node read-analytics-readme.js sections
        `);
        break;
    }
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const reader = new AnalyticsReadmeReader();
  reader.cli();
}

module.exports = AnalyticsReadmeReader;