import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'instructor';
  subscriptionExpiry: string | null;
  phone?: string;
};

export type Course = {
  id: string;
  name: string;
  description: string;
  intensity: 'bassa' | 'media' | 'alta';
  color: string;
};

export type ScheduleItem = {
  id: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  courseIntensity: string;
  day: string;
  time: string;
  instructor: string;
  capacity: number;
};

export type Booking = {
  id: string;
  scheduleId: string;
  courseName: string;
  courseColor: string;
  day: string;
  time: string;
  instructor: string;
  date: string;
  status: string;
};

// Context
interface AppContextType {
  user: User | null;
  courses: Course[];
  schedule: ScheduleItem[];
  bookings: Booking[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  bookClass: (scheduleId: string, date: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  isAdmin: boolean;
  isInstructor: boolean;
  isSubscriptionValid: boolean;
  refreshData: () => Promise<void>;
  getBookingCount: (scheduleId: string, date: string) => Promise<number>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getToken = () => localStorage.getItem('gymcity_token');

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  const loadCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) {
        const data = await res.json();
        setSchedule(data);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  }, []);

  const loadUserBookings = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/bookings/my');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        await loadUserBookings();
      } else {
        localStorage.removeItem('gymcity_token');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('gymcity_token');
    } finally {
      setLoading(false);
    }
  }, [loadUserBookings]);

  const refreshData = useCallback(async () => {
    await Promise.all([loadCourses(), loadSchedule()]);
    if (user) {
      await loadUserBookings();
    }
  }, [loadCourses, loadSchedule, loadUserBookings, user]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadCourses(), loadSchedule()]);
      await loadCurrentUser();
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Errore sconosciuto' }));
        toast({
          title: "Errore",
          description: data.message || "Credenziali non valide",
          variant: "destructive",
        });
        return false;
      }

      const data = await res.json();
      localStorage.setItem('gymcity_token', data.token);
      setUser(data.user);
      await loadUserBookings();

      toast({
        title: "Benvenuto!",
        description: `Accesso effettuato come ${data.user.role === 'admin' ? 'Amministratore' : data.user.role === 'instructor' ? 'Istruttore' : 'Utente'}`,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Errore",
        description: "Impossibile connettersi al server. Riprova.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('gymcity_token');
    setUser(null);
    setBookings([]);
    toast({
      title: "Arrivederci",
      description: "Disconnessione completata",
    });
  };

  const getBookingCount = async (scheduleId: string, date: string): Promise<number> => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/count/${scheduleId}/${date}`);
      if (res.ok) {
        const data = await res.json();
        return data.count;
      }
    } catch (error) {
      console.error('Error getting booking count:', error);
    }
    return 0;
  };

  const bookClass = async (scheduleId: string, date: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetchWithAuth('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ scheduleId, date })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Errore",
          description: data.message || "Impossibile effettuare la prenotazione",
          variant: "destructive",
        });
        return false;
      }

      await loadUserBookings();

      toast({
        title: "Prenotazione confermata!",
        description: "Ti aspettiamo in palestra.",
        className: "bg-primary text-primary-foreground border-none",
      });

      return true;
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore di connessione al server",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    try {
      const res = await fetchWithAuth(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Errore",
          description: data.message || "Impossibile cancellare la prenotazione",
          variant: "destructive",
        });
        return false;
      }

      await loadUserBookings();

      toast({
        title: "Prenotazione cancellata",
        description: "La tua prenotazione è stata rimossa.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore di connessione al server",
        variant: "destructive",
      });
      return false;
    }
  };

  const isSubscriptionValid = user?.role === 'admin' || user?.role === 'instructor' || 
    (user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false);

  return (
    <AppContext.Provider value={{
      user,
      courses,
      schedule,
      bookings,
      loading,
      login,
      logout,
      bookClass,
      cancelBooking,
      isAdmin: user?.role === 'admin',
      isInstructor: user?.role === 'instructor',
      isSubscriptionValid,
      refreshData,
      getBookingCount
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
