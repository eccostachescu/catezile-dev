import { supabase } from "@/integrations/supabase/client";

export const testClaudeReview = async () => {
  try {
    console.log('Testing Claude code review...');
    
    // Mock PR data for testing
    const mockPRData = {
      pr_number: "1",
      pr_title: "Homepage Light Mode + Live Events + Real Countdowns",
      pr_description: "Implementarea modului light implicit, secțiune LIVE reală, countdown-uri cu timp real și filtrare imagini pentru popular events",
      author: "eccostachescu",
      base_branch: "main",
      head_branch: "feature/homepage-redesign",
      changed_files: "src/styles/tokens.css,src/components/homepage/NewHomepage.tsx,src/components/homepage/LiveNowSection.tsx,src/components/homepage/HeroSearchNew.tsx,src/components/homepage/CardCountdown.tsx",
      diff_content: `--- a/src/styles/tokens.css
+++ b/src/styles/tokens.css
@@ -1,10 +1,15 @@
 :root {
-  --cz-bg: #0D111A;
-  --cz-surface: #111624;
-  --cz-ink: #E8ECF8;
+  --cz-bg: #F9FAFD;          /* porcelain */
+  --cz-surface: #FFFFFF;     /* card alb curat */
+  --cz-ink: #0A1020;         /* text principal */
+  --cz-ink-muted: #6B7280;   /* slate */
+  --cz-border: #E8EBF3;      /* linii subtile */
   --cz-primary: #5B8CFF;     /* brand */
-  --cz-accent: #FFC857;      /* amber */
+  --cz-accent: #FFB703;      /* amber mai cald */
+  --cz-hero-vignette: radial-gradient(1100px 380px at 50% -40%, rgba(91,140,255,.14), transparent);
+  --cz-shadow: 0 10px 30px rgba(16,24,40,.08);
 }
+
 .dark {
   --cz-bg: #0D111A;
   --cz-surface: #111624;`,
      repository: "eccostachescu/catezile-ro",
      github_token: "mock_token_for_test"
    };

    const { data, error } = await supabase.functions.invoke('claude-code-review', {
      body: mockPRData
    });

    if (error) {
      console.error('Error calling Claude review:', error);
      return { error: error.message };
    }

    console.log('Claude review result:', data);
    return data;

  } catch (error) {
    console.error('Test failed:', error);
    return { error: error.message };
  }
};