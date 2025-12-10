export const getCoordinatesFromOSM = async function (address: string, city: string) {
    const query = encodeURIComponent(`${address}, ${city}`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data || data.length === 0) {
        console.warn("⚠️ Nessuna coordinata trovata per:", address, city);
        return { latitude: null, longitude: null };
      }
  
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (error) {
      console.error("❌ Errore nel recupero delle coordinate:", error);
      return { latitude: null, longitude: null };
    }
  };
  

  export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raggio della Terra in km
  
    // Converti le latitudini e longitudini da gradi a radianti
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distanza in km
  }