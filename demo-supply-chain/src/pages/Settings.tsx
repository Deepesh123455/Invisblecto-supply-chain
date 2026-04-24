import { AppLayout } from "@/components/AppLayout";
import { Settings as SettingsIcon } from "lucide-react";

const SettingsPage = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Manage your platform configuration</p>
        </div>
        <div className="rounded-xl bg-card border card-shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <SettingsIcon className="h-10 w-10 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground font-body">Settings panel coming soon</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
