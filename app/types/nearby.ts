// app/types/nearby.ts
import { SafeEvent } from "./index"; // oppure dal percorso in cui è definito SafeEvent

export interface SafeNearbyEvent extends SafeEvent {
  distance: number;
}