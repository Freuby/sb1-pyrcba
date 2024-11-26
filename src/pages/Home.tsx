import React, { useState } from 'react';
import { Settings, Trash2, Download, Upload, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { SongCard } from '../components/SongCard';
import { CATEGORY_COLORS, SongCategory } from '../types';
import { ImportModal } from '../components/ImportModal';

const CategorySection: React.FC<{
  title: string;
  category: SongCategory;
  color: string;
  searchTerm: string;
}> = ({ title, category, color, searchTerm }) => {
  const { songs } = useSongs();
  const filteredSongs = songs
    .filter(song => song.category === category)
    .filter(song => 
      searchTerm === '' || 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.mnemonic && song.mnemonic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (song.lyrics && song.lyrics.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.title.localeCompare(b, 'fr'));

  if (searchTerm && filteredSongs.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color }}>
          {title}
        </h2>
        <span className="text-sm text-gray-500">
          {filteredSongs.length} chants
        </span>
      </div>
      <div className="space-y-4">
        {filteredSongs.map(song => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
};

export const Home = () => {
  const { selectedSongs, deleteSelectedSongs, clearSelection, songs, importSongs, deleteAllSongs } = useSongs();
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleDeleteSelected = () => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${selectedSongs.size} chant(s) ?`)) {
      deleteSelectedSongs();
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('⚠️ Voulez-vous vraiment supprimer TOUS les chants ?')) {
      if (window.confirm('Cette action est irréversible. Êtes-vous vraiment sûr ?')) {
        deleteAllSongs();
      }
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['title', 'category', 'mnemonic', 'lyrics', 'mediaLink'].join(','),
      ...songs.map(song => [
        `"${song.title.replace(/"/g, '""')}"`,
        song.category,
        `"${(song.mnemonic || '').replace(/"/g, '""')}"`,
        `"${(song.lyrics || '').replace(/"/g, '""')}"`,
        `"${(song.mediaLink || '').replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chants-capoeira.csv';
    link.click();
  };

  return (
    <div className="p-4 pb-20 safe-area-inset">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold truncate">CapoCanto</h1>
        <div className="flex space-x-2 ml-2">
          {!isSearching && (
            <>
              {selectedSongs.size > 0 && (
                <>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Supprimer la sélection"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={clearSelection}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    Annuler
                  </button>
                </>
              )}
              {songs.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Tout supprimer"
                >
                  <Trash2 size={24} />
                </button>
              )}
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Exporter les chants (CSV)"
              >
                <Upload size={24} className="text-gray-600" />
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Importer des chants (CSV)"
              >
                <Download size={24} className="text-gray-600" />
              </button>
            </>
          )}
          {isSearching ? (
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchTerm('');
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} className="text-gray-600" />
            </button>
          ) : (
            <button
              onClick={() => setIsSearching(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Search size={24} className="text-gray-600" />
            </button>
          )}
          {!isSearching && (
            <Link
              to="/settings"
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Settings size={24} className="text-gray-600" />
            </Link>
          )}
        </div>
      </div>

      {isSearching && (
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un chant..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      )}

      <CategorySection
        title="Angola"
        category="angola"
        color={CATEGORY_COLORS.angola}
        searchTerm={searchTerm}
      />
      <CategorySection
        title="São Bento Pequeno"
        category="saoBentoPequeno"
        color={CATEGORY_COLORS.saoBentoPequeno}
        searchTerm={searchTerm}
      />
      <CategorySection
        title="São Bento Grande"
        category="saoBentoGrande"
        color={CATEGORY_COLORS.saoBentoGrande}
        searchTerm={searchTerm}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={importSongs}
      />
    </div>
  );
};