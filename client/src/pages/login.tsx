import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/store";
import { useLocation } from "wouter";
import { Dumbbell } from "lucide-react";
import heroImage from '@assets/generated_images/modern_dark_gym_interior_with_neon_green_lighting.png';

import logoImg from '@assets/palestra-gym-city-pescara_1769876975532.jpg';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useApp();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (isAdmin: boolean) => {
    login(isAdmin);
    setLocation('/');
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      handleLogin(true);
    } else if (username.length > 0 && password.length > 0) {
      handleLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
       <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Background" 
            className="w-full h-full object-cover opacity-20 blur-sm"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

      <Card className="w-[400px] border-white/10 bg-card/80 backdrop-blur-xl relative z-10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(204,255,0,0.4)] bg-black">
              <img src={logoImg} alt="Gym City Logo" className="h-full w-full object-cover" />
            </div>
          </div>
          <CardTitle className="text-3xl font-display uppercase italic font-bold">Area Riservata</CardTitle>
          <CardDescription className="text-lg text-primary">Inserisci le credenziali fornite dalla palestra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome Utente</Label>
              <Input 
                id="username" 
                placeholder="Username" 
                className="bg-white/5 border-white/10" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="bg-white/5 border-white/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-black font-bold uppercase h-12">
              Accedi
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Demo Access</span>
            </div>
          </div>

           <Button 
            variant="ghost"
            className="w-full text-muted-foreground hover:text-white text-xs"
            onClick={() => handleLogin(true)}
          >
            Accesso Rapido Admin (Demo)
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-center text-xs text-muted-foreground px-8">
          In caso di smarrimento credenziali, rivolgersi alla reception.
        </CardFooter>
      </Card>
    </div>
  );
}
