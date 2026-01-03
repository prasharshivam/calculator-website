// JSON Formatter/Parser Tool

class JSONFormatter {
  constructor() {
    this.initEventListeners();
    this.loadSampleData();
  }

  initEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.tab).classList.add('active');
      });
    });

    // Format tab events
    document.getElementById('formatJson').addEventListener('click', () => this.formatJSON());
    document.getElementById('clearJson').addEventListener('click', () => this.clearInput('jsonInput'));
    document.getElementById('loadSample').addEventListener('click', () => this.loadSampleData());
    document.getElementById('copyFormatted').addEventListener('click', () => this.copyFormatted());
    document.getElementById('downloadFormatted').addEventListener('click', () => this.downloadFormatted());

    // Table tab events
    document.getElementById('parseTable').addEventListener('click', () => this.parseToTable());
    document.getElementById('clearTable').addEventListener('click', () => this.clearInput('tableJsonInput'));
    document.getElementById('exportCsv').addEventListener('click', () => this.exportCSV());
    document.getElementById('exportJson').addEventListener('click', () => this.exportTableJSON());

    // Minify tab events
    document.getElementById('minifyJson').addEventListener('click', () => this.minifyJSON());
    document.getElementById('clearMinify').addEventListener('click', () => this.clearInput('minifyInput'));
    document.getElementById('copyMinified').addEventListener('click', () => this.copyMinified());
    document.getElementById('downloadMinified').addEventListener('click', () => this.downloadMinified());
  }

  clearInput(inputId) {
    document.getElementById(inputId).value = '';
    this.clearResults();
  }

  clearResults() {
    document.getElementById('formatStatus').textContent = '';
    document.getElementById('formattedJson').innerHTML = '';
    document.getElementById('minifyStatus').textContent = '';
    document.getElementById('minifiedJson').textContent = '';
    document.getElementById('jsonTableContainer').innerHTML = '';
  }

  loadSampleData() {
    const sample = `[
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "zip": "10001"
        },
        "active": true,
        "scores": [85, 92, 78]
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "address": {
          "street": "456 Oak Ave",
          "city": "Los Angeles",
          "zip": "90001"
        },
        "active": false,
        "scores": [95, 88, 91]
      }
    ]`;
    document.getElementById('jsonInput').value = sample;
  }

  formatJSON() {
    const input = document.getElementById('jsonInput').value;
    const status = document.getElementById('formatStatus');
    const output = document.getElementById('formattedJson');

    try {
      const jsonObj = JSON.parse(input);
      const formatted = JSON.stringify(jsonObj, null, 2);
      output.innerHTML = this.syntaxHighlight(formatted);
      status.textContent = '✅ Valid JSON - Formatted successfully!';
      status.className = 'status-bar success';
    } catch (error) {
      status.textContent = `❌ Invalid JSON: ${error.message}`;
      status.className = 'status-bar error';
      output.innerHTML = `<code>${input}</code>`;
    }
  }

  minifyJSON() {
    const input = document.getElementById('minifyInput').value;
    const status = document.getElementById('minifyStatus');
    const output = document.getElementById('minifiedJson');

    try {
      const jsonObj = JSON.parse(input);
      const minified = JSON.stringify(jsonObj);
      output.textContent = minified;
      status.textContent = `✅ Minified successfully! Size reduced from ${input.length} to ${minified.length} characters (${((1 - minified.length / input.length) * 100).toFixed(1)}% smaller)`;
      status.className = 'status-bar success';
    } catch (error) {
      status.textContent = `❌ Invalid JSON: ${error.message}`;
      status.className = 'status-bar error';
      output.textContent = input;
    }
  }

  syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  parseToTable() {
    const input = document.getElementById('tableJsonInput').value;
    try {
      const data = JSON.parse(input);
      if (!Array.isArray(data)) {
        throw new Error('Table view requires a JSON array');
      }
      this.renderJsonTable(data);
    } catch (error) {
      document.getElementById('jsonTableContainer').innerHTML = `<p class="error">❌ ${error.message}</p>`;
    }
  }

  renderJsonTable(data, maxDepth = 2) {
    const container = document.getElementById('jsonTableContainer');
    
    if (data.length === 0) {
      container.innerHTML = '<p>No data to display</p>';
      return;
    }

    // Generate headers from first object
    const headers = this.getJsonHeaders(data[0], maxDepth);
    
    let tableHtml = `
      <div class="table-wrapper">
        <table class="json-table">
          <thead>
            <tr>${headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
    `;

    data.forEach((row, index) => {
      const rowData = headers.map(header => {
        const value = this.getNestedValue(row, header);
        return value === null || value === undefined ? '' : String(value);
      });
      tableHtml += `<tr>${rowData.map(v => `<td>${this.escapeHtml(v)}</td>`).join('')}</tr>`;
    });

    tableHtml += `
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = tableHtml;
  }

  getJsonHeaders(obj, maxDepth, currentPath = '', headers = []) {
    if (maxDepth <= 0 || typeof obj !== 'object' || obj === null) return headers;

    Object.keys(obj).forEach(key => {
      const path = currentPath ? `${currentPath}.${key}` : key;
      const value = obj[key];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.getJsonHeaders(value, maxDepth - 1, path, headers);
      } else {
        if (!headers.includes(path)) {
          headers.push(path);
        }
      }
    });

    return headers;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => 
      current && current[key] !== undefined ? current[key] : null, obj);
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  copyFormatted() {
    const content = document.getElementById('formattedJson').textContent;
    navigator.clipboard.writeText(content).then(() => {
      this.showToast('Formatted JSON copied!');
    });
  }

  copyMinified() {
    const content = document.getElementById('minifiedJson').textContent;
    navigator.clipboard.writeText(content).then(() => {
      this.showToast('Minified JSON copied!');
    });
  }

  downloadFormatted() {
    const content = document.getElementById('formattedJson').textContent;
    this.downloadFile(content, 'formatted.json', 'application/json');
  }

  downloadMinified() {
    const content = document.getElementById('minifiedJson').textContent;
    this.downloadFile(content, 'minified.json', 'application/json');
  }

  exportCSV() {
    const data = JSON.parse(document.getElementById('tableJsonInput').value);
    const depth = parseInt(document.getElementById('tableDepth').value);
    const headers = this.getJsonHeaders(data[0], depth);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => this.csvEscape(this.getNestedValue(row, h))).join(','))
    ].join('\n');
    
    this.downloadFile(csvContent, 'data.csv', 'text/csv');
  }

  exportTableJSON() {
    const data = JSON.parse(document.getElementById('tableJsonInput').value);
    this.downloadFile(JSON.stringify(data, null, 2), 'table-data.json', 'application/json');
  }

  csvEscape(value) {
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(`${filename} downloaded!`);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JSONFormatter();
});
