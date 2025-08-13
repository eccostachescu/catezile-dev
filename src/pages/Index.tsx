import { ResendKeysList } from '@/components/ResendKeysList';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Resend API Keys</h1>
          <p className="text-xl text-muted-foreground">Click the button below to fetch your Resend API keys</p>
        </div>
        <ResendKeysList />
      </div>
    </div>
  );
};

export default Index;
