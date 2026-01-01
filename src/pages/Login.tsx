/**
 * Login-Seite
 * Nur für registrierte Benutzer - keine Registrierung möglich
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Activity, Lock } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
});

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Prüfen ob bereits eingeloggt
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/', { replace: true });
      }
      setIsCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/', { replace: true });
      }
      setIsCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors = validation.error.errors;
      toast.error(errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Ungültige Anmeldedaten', {
            description: 'E-Mail oder Passwort ist falsch.',
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('E-Mail nicht bestätigt', {
            description: 'Bitte bestätigen Sie Ihre E-Mail-Adresse.',
          });
        } else {
          toast.error('Anmeldung fehlgeschlagen', {
            description: error.message,
          });
        }
        return;
      }

      if (data.user) {
        toast.success('Erfolgreich angemeldet');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <Card className="w-full max-w-md border-primary/20 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display">Feldengine</CardTitle>
            <CardDescription className="mt-2">
              Melden Sie sich mit Ihren Zugangsdaten an
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="bg-background"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Anmelden...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Anmelden
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Nur für registrierte Therapeuten.
              <br />
              Kontaktieren Sie den Administrator für Zugangsdaten.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
