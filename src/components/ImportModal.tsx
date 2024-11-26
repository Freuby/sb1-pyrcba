import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    songs: Array<{
      title: string;
      category: 'angola' | 'saoBentoPequeno' | 'saoBentoGrande';
      mnemonic?: string;
      lyrics?: string;
      mediaLink?: string;
    }>
  ) => void;
}

const parseCSV = (text: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '\r' || char === '\n') {
      if (inQuotes) {
        currentValue += char;
      } else {
        if (currentValue || row.length > 0) {
          row.push(currentValue);
          result.push(row);
        }
        row = [];
        currentValue = '';
      }
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
    i++;
  }

  if (currentValue || row.length > 0) {
    row.push(currentValue);
    result.push(row);
  }

  return result;
};

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      // Debugging: log raw parsed rows
      console.log('Parsed Rows:', rows);
      setDebugInfo([
        `Total rows: ${rows.length}`,
        `Headers: ${rows[0].join(', ')}`,
        `First data row: ${rows[1]?.join(', ') || 'No data rows'}`,
      ]);

      if (rows.length < 2) {
        throw new Error(
          'Le fichier CSV doit contenir au moins un en-tête et une ligne'
        );
      }

      const headers = rows[0].map((h) => h.toLowerCase().trim());
      console.log('Normalized Headers:', headers);

      // Forcibly ensure all columns are captured
      const songs = rows.slice(1).map((values, rowIndex) => {
        console.log(`Row ${rowIndex + 2} raw values:`, values);

        const song: any = {
          title: values[0] || '',
          category: values[1] || '',
          mnemonic: values[2] || '',
          lyrics: values[3] || '',
          mediaLink: values[4] || '',
        };

        if (!song.title && !song.mnemonic) {
          throw new Error(
            `Titre ou phrase mnémotechnique requis ligne ${rowIndex + 2}`
          );
        }

        if (
          !['angola', 'saoBentoPequeno', 'saoBentoGrande'].includes(
            song.category
          )
        ) {
          throw new Error(`Catégorie invalide ligne ${rowIndex + 2}`);
        }

        return song;
      });

      console.log('Processed Songs:', songs);

      onImport(songs);
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur d'importation";
      setError(errorMessage);
      console.error('Import Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Importer des chants</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-2">Format CSV requis :</p>
        <code className="block bg-gray-50 p-2 rounded mb-4 text-sm">
          title,category,mnemonic,lyrics,mediaLink
        </code>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
        )}

        {debugInfo.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 text-gray-700 rounded">
            <strong>Debug Info:</strong>
            <ul>
              {debugInfo.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
            Choisir un fichier CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
