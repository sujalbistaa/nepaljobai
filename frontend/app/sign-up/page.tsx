import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center px-5 py-20">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">

        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-sm bg-[var(--color-ink)] flex items-center justify-center shrink-0">
            <span className="mono text-[0.65rem] font-bold text-[var(--color-paper)]">N</span>
          </span>
          <span className="font-semibold text-base tracking-tight text-[var(--color-ink)]">
            NepalJobAI
          </span>
        </div>

        {/* Clerk component — same appearance tokens as sign-in */}
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#0F6E56",
              colorBackground: "#F2EEE2",
              colorInputBackground: "#F2EEE2",
              colorText: "#1A1A1A",
              colorTextSecondary: "#6B6B6B",
              colorInputText: "#1A1A1A",
              borderRadius: "4px",
              fontFamily: "var(--font-geist-sans)",
            },
            elements: {
              card: "shadow-none border border-[var(--color-rule)] bg-[var(--color-paper)]",
              headerTitle: "font-semibold text-[var(--color-ink)] tracking-tight",
              headerSubtitle: "text-[var(--color-muted)] text-sm",
              formButtonPrimary:
                "bg-[var(--color-accent)] hover:bg-[var(--color-accent)] opacity-100 hover:opacity-90 text-white font-medium text-sm rounded-[4px] transition-opacity",
              formFieldInput:
                "border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] rounded-[4px] text-sm focus:border-[var(--color-accent)] focus:ring-0",
              footerActionLink: "text-[var(--color-accent)] hover:underline",
              dividerLine: "bg-[var(--color-rule)]",
              dividerText: "text-[var(--color-muted)] text-xs",
              socialButtonsBlockButton:
                "border border-[var(--color-rule)] bg-[var(--color-paper)] hover:bg-[var(--color-paper-2)] text-sm rounded-[4px] transition-colors",
              socialButtonsBlockButtonText: "text-[var(--color-ink)] font-medium text-sm",
            },
          }}
        />
      </div>
    </main>
  );
}