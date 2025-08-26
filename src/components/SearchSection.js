import React, { useEffect, useRef, useState } from 'react';
import { apiFetch, apiUrl } from '../api';
import './SearchSection.css'; // Make sure to create this CSS file

function SearchSection() {
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/notes?search=' + encodeURIComponent(query));
      const data = await response.json();
      console.log("Search response data:", data);
      const raw = extractArrayFromResponse(data);
      const items = normalizeToItems(raw);
      const names = items.map((i) => i.name);
      const trimmed = (query || '').trim();
      const orderedNames = trimmed ? filterAndRank(names, trimmed) : names;
      
      // Process both files and folders
      const results = [];
      const folderSet = new Set();
      
      orderedNames.forEach((n) => {
        if (typeof n !== 'string') return;
        
        if (n.includes('/')) {
          // This is a file inside a folder - show the folder
          const root = getRootFolder(n);
          if (root && !folderSet.has(root)) {
            folderSet.add(root);
            results.push({ name: root, isFolder: true });
          }
        } else {
          // This is a standalone file - show it directly
          results.push({ name: n, isFolder: false });
        }
      });
      
      setNotes(results);
    } catch (error) {
      console.error("Error during search:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };
  
  const extractArrayFromResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.notes)) return data.notes;
    if (data && Array.isArray(data.result)) return data.result;
    return [];
  };

  const normalizeToItems = (arr) => {
    // Convert any response into [{ name, isFolder }]
    return arr.map((entry) => {
      if (typeof entry === 'string') {
        const looksLikeFolder = entry.endsWith('/') || (!entry.includes('.') && entry.includes('/'));
        return { name: entry, isFolder: looksLikeFolder };
      }
      if (entry && typeof entry === 'object') {
        const name = entry.name || entry.path || entry.fileName || '';
        const type = (entry.type || entry.kind || '').toString().toLowerCase();
        const isFolder = Boolean(entry.isFolder) || type === 'folder' || type === 'directory';
        return { name, isFolder };
      }
      return { name: String(entry), isFolder: false };
    }).filter((i) => i.name);
  };

  const getBaseName = (path) => {
    if (!path) return '';
    const parts = path.split(/[\/\\]/);
    const last = parts[parts.length - 1] || '';
    return last || (parts.length > 1 ? parts[parts.length - 2] : 'folder');
  };

  const getRootFolder = (path) => {
    if (!path) return '';
    const parts = String(path).split(/[\/\\]/).filter(Boolean);
    if (parts.length === 0) return '';
    return parts[0] + '/';
  };

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tokenize = (text) => text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const scoreName = (name, tokens) => {
    const lower = name.toLowerCase();
    let score = 0;
    tokens.forEach((t) => {
      const idx = lower.indexOf(t);
      if (idx === 0) score += 3; // starts with
      if (idx >= 0) score += 1; // contains
      if (idx >= 0) score += Math.max(0, 2 - idx / 50); // earlier positions get a bit more weight
    });
    score -= lower.length / 1000; // small preference for shorter names
    return score;
  };
  const filterAndRank = (all, rawQuery) => {
    const tokens = tokenize(rawQuery);
    if (tokens.length === 0) return [];
    return all
      .filter((name) => typeof name === 'string')
      .filter((name) => {
        const lower = name.toLowerCase();
        return tokens.every((t) => lower.includes(t));
      })
      .sort((a, b) => scoreName(b, tokens) - scoreName(a, tokens));
  };

  const renderHighlighted = (text, rawQuery) => {
    const tokens = tokenize(rawQuery);
    if (tokens.length === 0) return text;
    const pattern = new RegExp('(' + tokens.map(escapeRegex).join('|') + ')', 'ig');
    const parts = String(text).split(pattern);
    return parts.map((part, idx) => {
      const isMatch = tokens.includes(part.toLowerCase());
      return isMatch ? (
        <mark key={idx}>{part}</mark>
      ) : (
        <span key={idx}>{part}</span>
      );
    });
  };

  const attemptBinaryDownload = async (url, filename) => {
    const res = await fetch(apiUrl(url));
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(objectUrl);
    document.body.removeChild(a);
  };

  const handleDownload = async (item) => {
    try {
      if (item.isFolder) {
        const root = getRootFolder(item.name);
        const prefix = root.endsWith('/') ? root : root + '/';
        const noSlash = prefix.replace(/\/$/, '');
        const zipName = `${getBaseName(noSlash) || 'folder'}.zip`;
        const candidates = [
          `/api/notes/download-folder?prefix=${encodeURIComponent(prefix)}`,
          `/api/notes/download-folder/${encodeURIComponent(prefix)}`,
          `/api/notes/download-zip?prefix=${encodeURIComponent(prefix)}`,
        ];
        let lastErr;
        for (const url of candidates) {
          try {
            await attemptBinaryDownload(url, zipName);
            return;
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr || new Error('All folder download attempts failed');
      } else {
        const name = String(item.name);
        const candidates = [
          `/api/notes/download/${encodeURIComponent(name)}`,
          `/api/notes/download?path=${encodeURIComponent(name)}`
        ];
        let lastErr;
        for (const url of candidates) {
          try {
            await attemptBinaryDownload(url, name);
            return;
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr || new Error('All file download attempts failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Please try again or contact support.');
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setNotes([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

         debounceRef.current = setTimeout(async () => {
       try {
         const response = await apiFetch('/api/notes?search=' + encodeURIComponent(trimmed));
         const data = await response.json();
         const raw = extractArrayFromResponse(data);
         const items = normalizeToItems(raw);
         const names = items.map((i) => i.name);
         const orderedNames = filterAndRank(names, trimmed);
         
         // Process both files and folders (same logic as handleSearch)
         const results = [];
         const folderSet = new Set();
         
         orderedNames.forEach((n) => {
           if (typeof n !== 'string') return;
           
           if (n.includes('/')) {
             // This is a file inside a folder - show the folder
             const root = getRootFolder(n);
             if (root && !folderSet.has(root)) {
               folderSet.add(root);
               results.push({ name: root, isFolder: true });
             }
           } else {
             // This is a standalone file - show it directly
             results.push({ name: n, isFolder: false });
           }
         });
         
         setNotes(results);
       } catch (err) {
         console.error('Error fetching suggestions:', err);
         setNotes([]);
       } finally {
         // no-op
       }
     }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const renderNote = (note) => {
    if (typeof note === 'string' && note.includes("Restricted file:")) {
      return (
        <li key={note} className="search-item restricted">
          <span className="file-name">
            <i className="alert-icon"></i> {renderHighlighted(note, query)}
          </span>
        </li>
      );
    } else {
      const item = typeof note === 'string' ? { name: note, isFolder: false } : note;
      const linkLabel = item.isFolder ? 'Download ZIP' : 'Download';
      return (
        <li key={item.name} className="search-item">
          <span className="file-name">{renderHighlighted(item.name, query)}</span>
          <button
            className="download-link"
            onClick={() => handleDownload(item)}
          >
            {linkLabel}
          </button>
        </li>
      );
    }
  };

  return (
    <section className="search-section">
      <h2 className="search-title">Search Files</h2>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by file or folder name"
          aria-label="Search files"
          autoComplete="off"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-button" type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div role="status" aria-live="polite" style={{minHeight: 40}}>
        {loading ? (
          <div className="loading">
            <div className="loading-spinner" aria-label="Loading results" />
          </div>
        ) : (
          <ul className="search-results">
            {notes.map((note) => renderNote(note))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default SearchSection;
