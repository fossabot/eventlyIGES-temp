"use client"

import SettingsForm from "@/components/form-settings";
import { useCurrentUser } from "@/hooks/use-current-user";


const SettingsPage =  () => {
  const user =  useCurrentUser();

  return (
        <SettingsForm user={user} />
  );
};

export default SettingsPage;
