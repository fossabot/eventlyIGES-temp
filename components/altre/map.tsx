import React from "react";

interface MapProps {
  placeName?: string; // Nome del locale o indirizzo (opzionale)
  latitude?: number; // Latitudine (opzionale)
  longitude?: number; // Longitudine (opzionale)
}

const Map: React.FC<MapProps> = ({ placeName, latitude, longitude }) => {
  // Se abbiamo le coordinate, usiamo quelle, altrimenti usiamo il nome del locale
  const embedUrl = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`
    : placeName
    ? `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`
    : "";

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-black">Dove Trovarci</h3>
      <div className="mt-4 w-full h-[450px] rounded-xl overflow-hidden">
        <div className="w-full h-[300px] md:h-[400px] lg:h-[450px] rounded-lg overflow-hidden shadow-md">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <p className="text-center text-gray-500">Nessuna posizione disponibile</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
