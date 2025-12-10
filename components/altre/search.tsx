'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BiSearch, BiCalendar, BiBuildings } from 'react-icons/bi';

interface Suggestion {
  id: string;
  name: string;
  type: 'event' | 'organization';
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Funzione per fetchare i suggerimenti
  const fetchSuggestions = async (query: string) => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/suggestions?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounce: attende 300ms dopo l'ultima digitazione
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery]);

  // Chiude il dropdown se clicchi fuori dal componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-[400px] mx-auto">
      <div
        className="
          flex
          items-center
          border-[1px]
          w-full
          py-2
          pl-4
          rounded-full
          shadow-sm
          hover:shadow-md
          transition
          cursor-pointer
        "
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Cerca eventi o organizzazioni..."
          className="flex-grow px-4 py-2 focus:outline-none"
        />

        {/* L'icona di ricerca ora è solo estetica, senza logica onClick */}
        <div className="p-2 bg-blue-600 rounded-full text-white mr-2">
          <BiSearch size={18} />
        </div>
      </div>

      {/* Dropdown dei suggerimenti */}
      {showDropdown && (
        <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-md mt-1">
          {loadingSuggestions ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Caricamento suggerimenti...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion.id}
                  href={
                    suggestion.type === 'event'
                      ? `/events/${suggestion.id}`
                      : `/organization/${suggestion.id}`
                  }
                  onClick={() => {
                    setSearchQuery(suggestion.name);
                    setShowDropdown(false);
                  }}
                >
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                    {suggestion.type === 'event' ? (
                      <BiCalendar size={16} />
                    ) : (
                      <BiBuildings size={16} />
                    )}
                    <span>{suggestion.name}</span>
                  </li>
                </Link>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Nessun risultato trovato
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
