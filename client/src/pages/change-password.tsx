import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import { useLocation } from "wouter";
import { Loader2, AlertTriangle, Lock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ChangePasswordPage() {
  const { user, logout } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    if (newPassword.length < 6) {
      setError("La nuova password deve avere almeno 6 caratteri");
      return;
    }

    if (newPassword === currentPassword) {
      setError("La nuova password deve essere diversa da quella attuale");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('gymcity_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Errore durante il cambio password");
        return;
      }

      toast({
        title: "Password aggiornata!",
        description: "La tua password è stata cambiata con successo. Effettua nuovamente il login.",
      });

      // Logout e redirect al login
      logout();
      setLocation('/login');
    } catch (err) {
      setError("Errore di connessione al server");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display uppercase italic font-bold">Cambio Password Obbligatorio</CardTitle>
          <CardDescription className="text-base">
            Per motivi di sicurezza, devi cambiare la password prima di continuare.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Questa operazione è richiesta al primo accesso.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Attuale</Label>
              <Input 
                id="currentPassword" 
                type="password"
                placeholder="Inserisci la password attuale" 
                className="bg-white/5 border-white/10" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nuova Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                placeholder="Minimo 6 caratteri" 
                className="bg-white/5 border-white/10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Ripeti la nuova password" 
                className="bg-white/5 border-white/10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-black font-bold uppercase h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                'Cambia Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
