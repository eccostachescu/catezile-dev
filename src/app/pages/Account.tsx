import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RequireAuth from "@/components/common/RequireAuth";
import ProfileTab from "@/components/account/ProfileTab";
import NotificationsTab from "@/components/account/NotificationsTab";
import PrivacyTab from "@/components/account/PrivacyTab";

export default function Account() {
  return (
    <RequireAuth>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Contul meu</h1>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notificări</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          </TabsList>
          <TabsContent value="profile"><ProfileTab /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab /></TabsContent>
          <TabsContent value="privacy"><PrivacyTab /></TabsContent>
        </Tabs>
      </main>
    </RequireAuth>
  );
}
