import React, { useState } from 'react';
import { db } from './backend';

const shared = { artist: 'Artist', title: 'Album', format: 'Format', pressing: 'Pressing', discogsId: 'Discogs release ID' };
const columns = {
  shelf: { ...shared, year: 'Year', condition: 'Condition', value: 'Estimated value (USD)', openToTrade: 'Open to trade', notes: 'Copy notes' },
  wantlist: { ...shared, budget: 'Maximum budget (USD)' }
};

function csvCell(value) {
  let text = String(value ?? '');
  if (/^\s*[=+@-]|^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

async function readCollection(kind, userId) {
  const table = kind === 'shelf' ? 'shelf_items' : 'wantlist_items';
  const records = [];
  let after = null;
  while (true) {
    let query = db.from(table).select('id,payload').eq('user_id', userId).order('id').limit(500);
    if (after !== null) query = query.gt('id', after);
    const { data, error } = await query;
    if (error) throw error;
    if (!data.length) return records;
    records.push(...data.map(row => row.payload));
    after = data[data.length - 1].id;
  }
}

export default function CollectionExport({ kind, userId, items }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  async function download() {
    setBusy(true);
    setStatus('');
    try {
      const records = userId ? await readCollection(kind, userId) : items;
      const fields = columns[kind];
      const lines = [Object.values(fields), ...records.map(item => Object.keys(fields).map(key =>
        key === 'openToTrade' ? (item[key] ? 'Yes' : 'No') : item[key]
      ))];
      const csv = lines.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
      const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'spindle-' + kind + '.csv';
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      setStatus('Exported ' + records.length + (records.length === 1 ? ' record.' : ' records.'));
    } catch {
      setStatus('Export failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return <div className="flex items-center gap-2">
    <button type="button" className="bevel-btn px-2 py-1" disabled={busy} onClick={download}>
      {busy ? 'Exporting…' : 'Export full ' + kind + ' (CSV)'}
    </button>
    <span role="status">{status}</span>
  </div>;
}
