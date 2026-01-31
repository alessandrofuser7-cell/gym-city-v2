import React from 'react';
import { useApp } from '@/lib/store';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Calendar, Settings, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminPage() {
  const { user, courses, schedule, bookings } = useApp();
  const [, setLocation] = useLocation();

  if (!user || user.role !== 'admin') {
    // Basic protection
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl text-red-500">Accesso Negato</h1>
        <Button onClick={() => setLocation('/')} className="mt-4">Torna alla Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase italic mb-2">
            Admin <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Gestione corsi e prenotazioni.</p>
        </div>
        <Button className="bg-primary text-black font-bold uppercase">
          <PlusCircle className="mr-2 h-4 w-4" /> Nuovo Corso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Totale Corsi</CardTitle>
            <Settings className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{courses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lezioni Settimanali</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{schedule.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prenotazioni Attive</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{bookings.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="font-display uppercase italic">Elenco Corsi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-primary">Nome Corso</TableHead>
                <TableHead className="text-primary">Descrizione</TableHead>
                <TableHead className="text-primary">Intensità</TableHead>
                <TableHead className="text-right text-primary">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{course.name}</TableCell>
                  <TableCell className="text-muted-foreground">{course.description}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      course.intensity === 'alta' ? 'bg-red-500/20 text-red-500' :
                      course.intensity === 'media' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {course.intensity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
