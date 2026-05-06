import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { normalizePhoneForStorage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const USERNAME_DOMAIN = "piham.local";
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const usernameRe = /^[a-zA-Z0-9._-]{3,40}$/;

const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

const signUpSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Min. 6 caractères").max(72),
});

const Auth = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState<{ title: string; detail?: string } | null>(null);
  const [suFullName, setSuFullName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suLoading, setSuLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { document.title = "Connexion — PIHAM"; }, []);
  useEffect(() => {
    if (!authLoading && user && !phoneStep) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate, phoneStep]);

  const savePhoneAndContinue = async (skip = false) => {
    if (!skip) {
      const normalized = normalizePhoneForStorage(suPhone);
      if (!normalized) return toast.error("Numéro invalide (ex: +228 99 50 00 54)");
      setPhoneSaving(true);
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        const { error } = await supabase.from("profiles").update({ phone: normalized }).eq("id", u.user.id);
        if (error) { setPhoneSaving(false); return toast.error(error.message); }
      }
      setPhoneSaving(false);
      toast.success("Numéro enregistré");
    }
    setPhoneStep(false);
    navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    const parsed = signInSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      const msg = parsed.error.issues[0].message;
      setSignInError({ title: msg });
      return toast.error(msg);
    }
    const id = identifier.trim();
    let email = id;
    if (!isEmail(id)) {
      if (!usernameRe.test(id)) {
        const msg = "Nom d'utilisateur invalide (3-40 caractères, lettres/chiffres/._-)";
        setSignInError({ title: msg });
        return toast.error(msg);
      }
      email = `${id.toLowerCase()}@${USERNAME_DOMAIN}`;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const code = (error as any).code ?? "";
        const status = (error as any).status ?? 0;
        let title = "Identifiants invalides";
        let detail = "Vérifie ton email et ton mot de passe.";
        if (code === "email_not_confirmed" || /not confirmed/i.test(error.message)) {
          title = "Email non confirmé";
          detail = "Clique sur le lien envoyé dans ta boîte mail pour activer ton compte.";
        } else if (code === "invalid_credentials" || status === 400) {
          title = "Email ou mot de passe incorrect";
          detail = "Si tu as oublié ton mot de passe, utilise « Mot de passe oublié ? » ci-dessous.";
        } else if (status === 429 || /rate/i.test(error.message)) {
          title = "Trop de tentatives";
          detail = "Patiente quelques minutes avant de réessayer.";
        } else if (error.message) {
          detail = error.message;
        }
        setSignInError({ title, detail });
        toast.error(title);
        return;
      }
      // Connexion OK — vérifier le rôle admin si l'utilisateur arrive sur /auth pour l'admin
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        const isAdminUser = (roles ?? []).some((r: any) => r.role === "admin");
        toast.success(isAdminUser ? "Connecté en tant qu'admin" : "Connecté");
        // Si tentative explicite via username "admin" ou email admin sans rôle admin
        const looksLikeAdminAttempt =
          id.toLowerCase() === "admin" || /admin|piham_47/i.test(id);
        if (looksLikeAdminAttempt && !isAdminUser) {
          setSignInError({
            title: "Compte sans privilèges admin",
            detail:
              "Tu es bien connecté, mais ce compte n'a pas le rôle administrateur. Contacte un admin pour qu'il t'attribue le rôle.",
          });
        }
      }
    } catch (err: any) {
      const msg = err?.message ?? "Erreur inattendue";
      setSignInError({ title: "Erreur de connexion", detail: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const id = identifier.trim();
    if (!id || !isEmail(id)) return toast.error("Saisis ton email d'abord");
    const email = id;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Email de réinitialisation envoyé");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ email: suEmail, password: suPassword });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSuLoading(true);
    try {
      const email = suEmail.trim().toLowerCase();
      const { error } = await supabase.auth.signUp({
        email,
        password: suPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: suFullName.trim() ? { full_name: suFullName.trim() } : undefined,
        },
      });
      if (error) throw error;
      await supabase.auth.signInWithPassword({ email, password: suPassword });
      setPhoneStep(true);
    } catch (err: any) {
      toast.error(err.message ?? "Erreur d'inscription");
    } finally { setSuLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-24 bg-background relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70"
        style={{ background: "var(--gradient-mesh)" }}
      />
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-elevated">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Retour</Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))] via-[hsl(330_90%_55%)] to-[hsl(var(--gold))] flex items-center justify-center shadow-[0_0_24px_hsl(var(--accent)/0.4)]">
            <span className="text-white font-display font-bold text-lg">P</span>
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground leading-tight">Espace client</h1>
            <p className="text-xs text-muted-foreground">Authentification sécurisée PIHAM</p>
          </div>
        </div>

        {phoneStep ? (
          <div className="mt-7 space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Ajoute ton WhatsApp</h2>
              <p className="text-xs text-muted-foreground mt-1">Pour recevoir les notifications de tes devis. Optionnel.</p>
            </div>
            <div>
              <Label htmlFor="ps-phone">Numéro WhatsApp</Label>
              <Input id="ps-phone" type="tel" autoComplete="tel" placeholder="+228 99 50 00 54" value={suPhone} onChange={(e) => setSuPhone(e.target.value)} maxLength={30} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => savePhoneAndContinue(true)} disabled={phoneSaving}>
                Plus tard
              </Button>
              <Button type="button" className="flex-1 btn-primary" onClick={() => savePhoneAndContinue(false)} disabled={phoneSaving}>
                {phoneSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        ) : (
        <Tabs defaultValue="signin" className="mt-7">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="identifier">Email ou nom d'utilisateur</Label>
                <Input id="identifier" type="text" autoComplete="username" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setSignInError(null); }} maxLength={255} required />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setSignInError(null); }} maxLength={72} required />
              </div>
              {signInError && (
                <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                  <div className="font-semibold">{signInError.title}</div>
                  {signInError.detail && <div className="mt-0.5 text-destructive/80">{signInError.detail}</div>}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                Mot de passe oublié ?
              </button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-5">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) toast.error(result.error.message ?? "Erreur Google");
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              S'inscrire avec Google
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-[11px]"><span className="bg-card px-2 text-muted-foreground">ou inscription classique</span></div>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" type="email" autoComplete="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} maxLength={255} required />
              </div>
              <div>
                <Label htmlFor="su-pass">Mot de passe</Label>
                <Input id="su-pass" type="password" autoComplete="new-password" value={suPassword} onChange={(e) => setSuPassword(e.target.value)} maxLength={72} required />
                <p className="mt-1 text-[11px] text-muted-foreground">Min. 6 caractères.</p>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Ajouter nom (optionnel)</summary>
                <div className="mt-3">
                  <Label htmlFor="su-name">Nom complet</Label>
                  <Input id="su-name" type="text" autoComplete="name" value={suFullName} onChange={(e) => setSuFullName(e.target.value)} maxLength={100} />
                </div>
              </details>
              <Button type="submit" disabled={suLoading} className="w-full btn-primary">
                {suLoading ? "Création..." : "Créer mon compte"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </main>
  );
};

export default Auth;