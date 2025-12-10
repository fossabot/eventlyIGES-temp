interface DateFormatterProps {
    dateISO: string;
    /**
     * Se true, aggiunge il giorno della settimana (in Italiano) prima della data.
     * Esempio: "lun 13/01 10:30"
     */
    showDayName?: boolean;
  }
  
  const DateFormatter = ({ dateISO, showDayName = false }: DateFormatterProps) => {
    // Converto la stringa ISO in un oggetto Data
    const date = new Date(dateISO);
  
    // Array con i giorni abbreviati in italiano.
    // Ricorda che getDay() in JS: 0 = Domenica, 6 = Sabato
    const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const dayName = dayNames[date.getDay()];
  
    // Estraggo i componenti della data
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // I mesi partono da 0 a 11
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    // Formattazione della stringa con o senza giorno della settimana
    const formattedDate = showDayName 
      ? `${dayName}, ${day}/${month} ${hours}:${minutes}`
      : `${day}/${month} ${hours}:${minutes}`;
  
    return <>{formattedDate}</>;
  };
  
  export default DateFormatter;
  