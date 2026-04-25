import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Calendar, Settings, PlusCircle, UserPlus, Edit, Trash2, 
  AlertTriangle, CheckCircle, XCircle, Search, Loader2, Save, X,
  Download, Clock, Bell, FileSpreadsheet
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addMonths } from 'date-fns';
import { it } from 'date-fns/locale';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'user' | 'instructor';
  subscriptionExpiry: string | null;
  isActive: boolean;
  createdAt: string;
};

type ExpiringUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscriptionExpiry: string;
};

type ExpiringData = {
  expiringIn7Days: ExpiringUser[];
  expiringIn30Days: ExpiringUser[];
  expired: ExpiringUser[];
};

export default function AdminPage() {
  const { user, courses, schedule } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expiringData, setExpiringData] = useState<ExpiringData | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSendingNotifications, setIsSendingNotifications] = useState(false);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'user' as 'admin' | 'user' | 'instructor',
    subscriptionExpiry: ''
  });

  const getToken = () => localStorage.getItem('gymcity_token');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiringSubscriptions = async () => {
    try {
      const res = await fetch('/api/admin/expiring-subscriptions', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpiringData(data);
      }
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gymcity_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast({ title: "Backup completato", description: "Il file è stato scaricato" });
      }
    } catch (error) {
      toast({ title: "Errore", description: "Errore durante il backup", variant: "destructive" });
    } finally {
      setIsBackingUp(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchExpiringSubscriptions();
    }
  }, [user]);

  const handleSendNotifications = async () => {
    setIsSendingNotifications(true);
    try {
      const res = await fetch('/api/admin/send-expiry-notifications', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast({ 
          title: "Notifiche Inviate", 
          description: data.message 
        });
      } else {
        toast({ title: "Errore", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Errore", description: "Errore durante l'invio", variant: "destructive" });
    } finally {
      setIsSendingNotifications(false);
    }
  };

  const handleExportCSV = () => {
    if (!expiringData) return;

    const rows: string[] = ['Nome,Email,Telefono,Scadenza,Stato,Giorni Rimanenti'];
    
    const addRows = (users: ExpiringUser[], stato: string) => {
      users.forEach(u => {
        const daysLeft = differenceInDays(new Date(u.subscriptionExpiry), new Date());
        const expDate = format(new Date(u.subscriptionExpiry), 'dd/MM/yyyy');
        rows.push(`"${u.name}","${u.email}","${u.phone || ''}","${expDate}","${stato}","${daysLeft}"`);
      });
    };

    addRows(expiringData.expired, 'Scaduto');
    addRows(expiringData.expiringIn7Days, 'Scade in 7gg');
    addRows(expiringData.expiringIn30Days, 'Scade in 30gg');

    const csvContent = rows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scadenze_abbonamenti_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();

    toast({ title: "CSV esportato", description: "File scadenze scaricato" });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl text-red-500">Accesso Negato</h1>
        <Button onClick={() => setLocation('/')} className="mt-4">Torna alla Home</Button>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      role: 'user',
      subscriptionExpiry: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
    });
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast({ title: "Errore", description: "Compila tutti i campi obbligatori", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          subscriptionExpiry: formData.role === 'user' ? formData.subscriptionExpiry : null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Errore", description: data.message, variant: "destructive" });
        return;
      }

      toast({ title: "Utente creato", description: `${formData.name} è stato registrato con successo` });
      setShowCreateDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast({ title: "Errore", description: "Errore di connessione", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setFormData({
      email: u.email,
      password: '',
      name: u.name,
      phone: u.phone || '',
      role: u.role,
      subscriptionExpiry: u.subscriptionExpiry ? format(new Date(u.subscriptionExpiry), 'yyyy-MM-dd') : ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        subscriptionExpiry: formData.role === 'user' && formData.subscriptionExpiry 
          ? new Date(formData.subscriptionExpiry).toISOString() 
          : null
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const res = await fetch(`/api/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Errore", description: data.message, variant: "destructive" });
        return;
      }

      toast({ title: "Utente aggiornato", description: `${formData.name} è stato modificato` });
      setShowEditDialog(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast({ title: "Errore", description: "Errore di connessione", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (u: AdminUser) => {
    try {
      const res = await fetch(`/api/auth/users/${u.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ isActive: !u.isActive })
      });

      if (res.ok) {
        toast({ 
          title: u.isActive ? "Utente disattivato" : "Utente riattivato",
          description: `${u.name} è stato ${u.isActive ? 'disattivato' : 'riattivato'}`
        });
        fetchUsers();
      }
    } catch (error) {
      toast({ title: "Errore", description: "Errore di connessione", variant: "destructive" });
    }
  };

  const getSubscriptionStatus = (expiry: string | null) => {
    if (!expiry) return { status: 'none', label: 'N/A', color: 'bg-gray-500/20 text-gray-400' };
    
    const daysLeft = differenceInDays(new Date(expiry), new Date());
    
    if (daysLeft < 0) {
      return { status: 'expired', label: 'Scaduto', color: 'bg-red-500/20 text-red-500' };
    } else if (daysLeft <= 7) {
      return { status: 'expiring', label: `${daysLeft}g`, color: 'bg-amber-500/20 text-amber-500' };
    } else if (daysLeft <= 30) {
      return { status: 'warning', label: `${daysLeft}g`, color: 'bg-yellow-500/20 text-yellow-500' };
    } else {
      return { status: 'active', label: `${daysLeft}g`, color: 'bg-green-500/20 text-green-500' };
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userStats = {
    total: users.length,
    active: users.filter(u => u.isActive && u.role === 'user').length,
    expiring: users.filter(u => {
      if (u.role !== 'user' || !u.subscriptionExpiry) return false;
      const days = differenceInDays(new Date(u.subscriptionExpiry), new Date());
      return days >= 0 && days <= 7;
    }).length,
    expired: users.filter(u => {
      if (u.role !== 'user' || !u.subscriptionExpiry) return false;
      return new Date(u.subscriptionExpiry) < new Date();
    }).length
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase italic mb-2">
            Admin <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Gestione utenti, corsi e abbonamenti.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="border-white/10"
            onClick={handleBackup}
            disabled={isBackingUp}
          >
            {isBackingUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Backup
          </Button>
          <Button 
            className="bg-primary text-black font-bold uppercase"
            onClick={() => { resetForm(); setShowCreateDialog(true); }}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Nuovo Utente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Utenti Totali</p>
                <p className="text-3xl font-bold text-white">{userStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Abbonamenti Attivi</p>
                <p className="text-3xl font-bold text-green-500">{userStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">In Scadenza (7gg)</p>
                <p className="text-3xl font-bold text-amber-500">{userStats.expiring}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Scaduti</p>
                <p className="text-3xl font-bold text-red-500">{userStats.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-card/50 border border-white/10 mb-6">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Users className="mr-2 h-4 w-4" /> Utenti
          </TabsTrigger>
          <TabsTrigger value="expiring" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Bell className="mr-2 h-4 w-4" /> Scadenze
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Settings className="mr-2 h-4 w-4" /> Corsi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="font-display uppercase italic">Gestione Utenti</CardTitle>
                  <CardDescription>Crea, modifica e gestisci gli abbonamenti</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cerca utente..." 
                    className="pl-10 bg-white/5 border-white/10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-primary">Nome</TableHead>
                        <TableHead className="text-primary">Email</TableHead>
                        <TableHead className="text-primary">Ruolo</TableHead>
                        <TableHead className="text-primary">Scadenza</TableHead>
                        <TableHead className="text-primary">Stato</TableHead>
                        <TableHead className="text-right text-primary">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => {
                        const subStatus = getSubscriptionStatus(u.subscriptionExpiry);
                        return (
                          <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-medium text-white">{u.name}</TableCell>
                            <TableCell className="text-muted-foreground">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs uppercase ${
                                u.role === 'admin' ? 'border-purple-500 text-purple-500' :
                                u.role === 'instructor' ? 'border-blue-500 text-blue-500' :
                                'border-white/20 text-white'
                              }`}>
                                {u.role === 'admin' ? 'Admin' : u.role === 'instructor' ? 'Istruttore' : 'Utente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {u.role === 'user' && u.subscriptionExpiry ? (
                                <div className="flex flex-col">
                                  <span className="text-sm text-white">
                                    {format(new Date(u.subscriptionExpiry), 'd MMM yyyy', { locale: it })}
                                  </span>
                                  <Badge className={`w-fit mt-1 text-[10px] ${subStatus.color}`}>
                                    {subStatus.label}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {u.isActive ? (
                                <Badge className="bg-green-500/20 text-green-500">Attivo</Badge>
                              ) : (
                                <Badge className="bg-red-500/20 text-red-500">Disattivato</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-primary hover:text-primary/80"
                                  onClick={() => handleEditUser(u)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={u.isActive ? "text-red-500 hover:text-red-400" : "text-green-500 hover:text-green-400"}
                                  onClick={() => handleToggleActive(u)}
                                >
                                  {u.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <div className="flex flex-wrap gap-3 mb-6">
            <Button 
              onClick={handleSendNotifications}
              disabled={isSendingNotifications}
              className="bg-primary text-black font-bold"
            >
              {isSendingNotifications ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
              Invia Notifiche Email
            </Button>
            <Button 
              data-testid="export-csv-btn"
              variant="outline"
              className="border-white/10"
              onClick={handleExportCSV}
              disabled={!expiringData}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Esporta CSV
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Invia email di promemoria o esporta la lista scadenze in formato CSV.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scaduti */}
            <Card className="bg-card border-red-500/20">
              <CardHeader>
                <CardTitle className="font-display uppercase italic text-red-500 flex items-center gap-2">
                  <XCircle className="h-5 w-5" /> Scaduti
                </CardTitle>
                <CardDescription>Abbonamenti già scaduti</CardDescription>
              </CardHeader>
              <CardContent>
                {expiringData?.expired.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nessun abbonamento scaduto</p>
                ) : (
                  <div className="space-y-3">
                    {expiringData?.expired.map(u => (
                      <div key={u.id} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                        {u.phone && <p className="text-sm text-muted-foreground">{u.phone}</p>}
                        <p className="text-xs text-red-500 mt-1">
                          Scaduto il {format(new Date(u.subscriptionExpiry), 'd MMM yyyy', { locale: it })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In scadenza 7 giorni */}
            <Card className="bg-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="font-display uppercase italic text-amber-500 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Scadono in 7 giorni
                </CardTitle>
                <CardDescription>Richiede attenzione immediata</CardDescription>
              </CardHeader>
              <CardContent>
                {expiringData?.expiringIn7Days.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nessuno in scadenza</p>
                ) : (
                  <div className="space-y-3">
                    {expiringData?.expiringIn7Days.map(u => (
                      <div key={u.id} className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                        {u.phone && <p className="text-sm text-muted-foreground">{u.phone}</p>}
                        <p className="text-xs text-amber-500 mt-1">
                          Scade il {format(new Date(u.subscriptionExpiry), 'd MMM yyyy', { locale: it })}
                          {' '}({differenceInDays(new Date(u.subscriptionExpiry), new Date())} giorni)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In scadenza 30 giorni */}
            <Card className="bg-card border-yellow-500/20">
              <CardHeader>
                <CardTitle className="font-display uppercase italic text-yellow-500 flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Scadono in 30 giorni
                </CardTitle>
                <CardDescription>Da monitorare</CardDescription>
              </CardHeader>
              <CardContent>
                {expiringData?.expiringIn30Days.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nessuno in scadenza</p>
                ) : (
                  <div className="space-y-3">
                    {expiringData?.expiringIn30Days.map(u => (
                      <div key={u.id} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                        {u.phone && <p className="text-sm text-muted-foreground">{u.phone}</p>}
                        <p className="text-xs text-yellow-500 mt-1">
                          Scade il {format(new Date(u.subscriptionExpiry), 'd MMM yyyy', { locale: it })}
                          {' '}({differenceInDays(new Date(u.subscriptionExpiry), new Date())} giorni)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="font-display uppercase italic">Elenco Corsi</CardTitle>
              <CardDescription>Corsi disponibili in palestra</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-primary">Nome Corso</TableHead>
                    <TableHead className="text-primary">Descrizione</TableHead>
                    <TableHead className="text-primary">Intensità</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${course.color}`}></div>
                          {course.name}
                        </div>
                      </TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="border-white/10 bg-card/95 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase italic text-2xl">Nuovo Utente</DialogTitle>
            <DialogDescription>
              Crea un nuovo account per un cliente della palestra
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input 
                id="name"
                placeholder="Mario Rossi"
                className="bg-white/5 border-white/10"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email"
                type="email"
                placeholder="mario.rossi@email.com"
                className="bg-white/5 border-white/10"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input 
                id="password"
                type="password"
                placeholder="Minimo 6 caratteri"
                className="bg-white/5 border-white/10"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input 
                id="phone"
                placeholder="+39 333 1234567"
                className="bg-white/5 border-white/10"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utente</SelectItem>
                  <SelectItem value="instructor">Istruttore</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="expiry">Scadenza Abbonamento</Label>
                <Input 
                  id="expiry"
                  type="date"
                  className="bg-white/5 border-white/10"
                  value={formData.subscriptionExpiry}
                  onChange={(e) => setFormData({...formData, subscriptionExpiry: e.target.value})}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
              <X className="mr-2 h-4 w-4" /> Annulla
            </Button>
            <Button 
              className="bg-primary text-black font-bold" 
              onClick={handleCreateUser}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Crea Utente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="border-white/10 bg-card/95 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase italic text-2xl">Modifica Utente</DialogTitle>
            <DialogDescription>
              Modifica i dati di {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome Completo</Label>
              <Input 
                id="edit-name"
                className="bg-white/5 border-white/10"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email"
                type="email"
                className="bg-white/5 border-white/10 opacity-50"
                value={formData.email}
                disabled
              />
              <p className="text-xs text-muted-foreground">L'email non può essere modificata</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nuova Password</Label>
              <Input 
                id="edit-password"
                type="password"
                placeholder="Lascia vuoto per non modificare"
                className="bg-white/5 border-white/10"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefono</Label>
              <Input 
                id="edit-phone"
                className="bg-white/5 border-white/10"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utente</SelectItem>
                  <SelectItem value="instructor">Istruttore</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="edit-expiry">Scadenza Abbonamento</Label>
                <Input 
                  id="edit-expiry"
                  type="date"
                  className="bg-white/5 border-white/10"
                  value={formData.subscriptionExpiry}
                  onChange={(e) => setFormData({...formData, subscriptionExpiry: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  L'utente non potrà prenotare dopo questa data
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowEditDialog(false); setEditingUser(null); }}>
              <X className="mr-2 h-4 w-4" /> Annulla
            </Button>
            <Button 
              className="bg-primary text-black font-bold" 
              onClick={handleUpdateUser}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
