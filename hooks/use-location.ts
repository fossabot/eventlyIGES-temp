"use client";

import { useState, useEffect } from "react";

const useLocation = () => {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getLocation = () => {
    console.log("→ Chiamata getLocation()");
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      console.error("navigator.geolocation NON disponibile");
      setLoadingLocation(false);
      return;
    }

    console.log("navigator.geolocation esiste, richiedo posizione…");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("SUCCESSO:", position);
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLoadingLocation(false);
      },
      (error) => {
        console.log("ERRORE RAW:", error);
        console.log("error.code:", error?.code);
        console.log("error.message:", error?.message);

        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { userCoords, loadingLocation, getLocation };
};

export default useLocation;
