import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Flame, Zap, Activity, User, CalendarDays } from "lucide-react";
import heroImage from '@assets/generated_images/modern_dark_gym_interior_with_neon_green_lighting.png';
import patternImage from '@assets/generated_images/sporty_abstract_geometric_pattern_dark_neon_green.png';
import { useApp } from "@/lib/store";

import realGymBg from '@assets/1168-gym-city-pescara-a-s-d-img-Jspho_1770023684389.jpeg';

export default function Home() {
  const { courses } = useApp();

  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={realGymBg} 
            alt="Gym Hero" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="container relative z-10 px-4 text-center">
          <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 text-sm font-bold tracking-widest uppercase bg-black/50 backdrop-blur">
            Welcome to the future of fitness
          </Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white uppercase italic tracking-tighter mb-6 neon-text drop-shadow-2xl leading-none px-2">
            I NOSTRI PREZZI <span className="text-primary">ATTIRANO</span>,<br />
            MA È LA NOSTRA ESSENZA A <span className="text-white">CONQUISTARE</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Scopri i nostri corsi esclusivi a Pescara. <br/>
            Body Sculpt, Funzionale, Pump e molto altro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calendar">
              <Button size="lg" className="h-14 px-8 text-lg font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-black border-none hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,165,0,0.4)]">
                Prenota Ora
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold uppercase tracking-wider border-white/30 hover:bg-white/10 text-white hover:text-primary hover:border-primary transition-all backdrop-blur-sm">
                Scopri i Corsi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <div className="bg-primary text-black py-4 overflow-hidden whitespace-nowrap border-y border-white/10 relative z-20">
        <div className="flex items-center gap-12 animate-infinite-scroll text-xl font-display font-bold uppercase italic tracking-tighter">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center gap-4">
              <Zap className="h-6 w-6 fill-black" /> NO PAIN NO GAIN <Zap className="h-6 w-6 fill-black" /> JOIN THE REVOLUTION
            </span>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <section className="py-20 bg-background relative">
         <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${patternImage})`, backgroundSize: 'cover' }}></div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold uppercase italic mb-2">
                I Nostri <span className="text-primary">Corsi</span>
              </h2>
              <p className="text-muted-foreground text-lg">Scegli l'allenamento perfetto per te</p>
            </div>
            <Link href="/calendar">
              <Button variant="link" className="text-primary font-bold uppercase tracking-wider hidden md:flex items-center gap-2 group">
                Vedi tutti <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="group overflow-hidden border-none bg-card/50 hover:bg-card transition-colors duration-300">
                <div className={`h-2 w-full ${course.color}`} />
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="uppercase tracking-wider font-bold text-xs bg-white/5 text-white border-white/10 group-hover:bg-primary group-hover:text-black transition-colors">
                      {course.intensity} Intensity
                    </Badge>
                    <Flame className={`h-6 w-6 ${course.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase italic mb-3 text-white group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-muted-foreground mb-6 line-clamp-2">
                    {course.description}
                  </p>
                  <Link href="/calendar">
                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 group-hover:border-primary/50 transition-all font-bold uppercase tracking-wider">
                      Prenota Lezione
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
             <Link href="/calendar">
              <Button variant="outline" className="w-full text-primary border-primary/50 font-bold uppercase tracking-wider">
                Vedi tutti i corsi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Info Section */}
      <section className="py-20 border-t border-white/5 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-4xl font-display font-bold text-white mb-2">12+</h3>
              <p className="text-muted-foreground uppercase tracking-widest text-sm">Discipline Diverse</p>
            </div>
            <div className="p-6 border-l border-r border-white/5">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-4xl font-display font-bold text-white mb-2">500+</h3>
              <p className="text-muted-foreground uppercase tracking-widest text-sm">Atleti Iscritti</p>
            </div>
            <div className="p-6">
              <CalendarDays className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-4xl font-display font-bold text-white mb-2">7/7</h3>
              <p className="text-muted-foreground uppercase tracking-widest text-sm">Aperti ogni giorno</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
