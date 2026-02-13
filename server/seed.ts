import mongoose from 'mongoose';
import User from './models/User';
import Course from './models/Course';
import Schedule from './models/Schedule';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gymcity';

const COURSES_DATA = [
  { name: 'Body Sculpt', description: 'Tonificazione completa per tutto il corpo.', intensity: 'media', color: 'bg-pink-500' },
  { name: 'Funzionale', description: 'Allenamento a circuito per forza e resistenza.', intensity: 'alta', color: 'bg-orange-500' },
  { name: 'Abdominal Gluteo Killer', description: 'Focus mirato su addominali e glutei.', intensity: 'alta', color: 'bg-red-500' },
  { name: 'Pump', description: 'Allenamento con bilancieri a ritmo di musica.', intensity: 'alta', color: 'bg-purple-500' },
  { name: 'Posturale', description: 'Ginnastica per migliorare la postura e la flessibilità.', intensity: 'bassa', color: 'bg-blue-400' },
  { name: 'Burn & Tone', description: 'Cardio e tonificazione ad alta intensità.', intensity: 'alta', color: 'bg-yellow-500' },
  { name: 'Pilates', description: 'Controllo, precisione e fluidità del movimento.', intensity: 'bassa', color: 'bg-teal-500' },
  { name: 'Estetica', description: 'Esercizi mirati alla definizione muscolare.', intensity: 'media', color: 'bg-indigo-500' },
  { name: 'Fullbody Workout', description: 'Allenamento completo che coinvolge tutti i gruppi muscolari.', intensity: 'media', color: 'bg-green-500' },
  { name: 'GAG', description: 'Gambe, Addominali, Glutei.', intensity: 'media', color: 'bg-rose-500' },
  { name: 'Total Body Coreografico', description: 'Allenamento aerobico con coreografie.', intensity: 'media', color: 'bg-cyan-500' },
  { name: 'Triceps Legs + Butt', description: 'Focus su tricipiti, gambe e glutei.', intensity: 'media', color: 'bg-fuchsia-500' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Schedule.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      email: 'admin@gymcity.com',
      password: 'admin123',
      name: 'Admin Gym City',
      role: 'admin',
      subscriptionExpiry: null
    });
    console.log('Admin created:', admin.email);

    // Create instructor users
    const instructors: any = {};
    const instructorData = [
      { name: 'Gianluca', email: 'gianluca@gymcity.com' },
      { name: 'Andrea', email: 'andrea@gymcity.com' },
      { name: 'Sisto', email: 'sisto@gymcity.com' },
      { name: 'Luca', email: 'luca@gymcity.com' },
      { name: 'Hanna', email: 'hanna@gymcity.com' },
    ];

    for (const inst of instructorData) {
      const instructor = await User.create({
        email: inst.email,
        password: 'instructor123',
        name: inst.name,
        role: 'instructor',
        subscriptionExpiry: null
      });
      instructors[inst.name] = instructor;
      console.log('Instructor created:', instructor.name);
    }

    // Create a sample user with active subscription
    const sampleUser = await User.create({
      email: 'mario.rossi@example.com',
      password: 'user123',
      name: 'Mario Rossi',
      phone: '+39 333 1234567',
      role: 'user',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    console.log('Sample user created:', sampleUser.email);

    // Create courses
    const courses: any = {};
    for (const courseData of COURSES_DATA) {
      const course = await Course.create(courseData);
      courses[course.name] = course;
    }
    console.log('Courses created:', Object.keys(courses).length);

    // Create schedule
    const scheduleData = [
      // Lunedì
      { course: 'Body Sculpt', day: 'Lunedì', time: '10:00/11:00', instructor: 'Gianluca', capacity: 20 },
      { course: 'Funzionale', day: 'Lunedì', time: '13:30/14:30', instructor: 'Andrea', capacity: 20 },
      { course: 'Abdominal Gluteo Killer', day: 'Lunedì', time: '18:05/19:05', instructor: 'Gianluca', capacity: 20 },
      { course: 'Pump', day: 'Lunedì', time: '19:15/20:15', instructor: 'Gianluca', capacity: 25 },
      
      // Martedì
      { course: 'Posturale', day: 'Martedì', time: '09:30/10:30', instructor: 'Sisto', capacity: 20 },
      { course: 'Posturale', day: 'Martedì', time: '10:30/11:30', instructor: 'Sisto', capacity: 20 },
      { course: 'Burn & Tone', day: 'Martedì', time: '13:30/14:30', instructor: 'Luca', capacity: 20 },
      { course: 'Pilates', day: 'Martedì', time: '16:15/17:15', instructor: 'Hanna', capacity: 20 },
      { course: 'Pilates', day: 'Martedì', time: '17:15/18:15', instructor: 'Hanna', capacity: 20 },
      { course: 'Funzionale', day: 'Martedì', time: '18:35/19:35', instructor: 'Andrea', capacity: 20 },
      { course: 'Estetica', day: 'Martedì', time: '19:40/20:40', instructor: 'Gianluca', capacity: 20 },

      // Mercoledì
      { course: 'GAG', day: 'Mercoledì', time: '10:00/11:00', instructor: 'Gianluca', capacity: 20 },
      { course: 'Funzionale', day: 'Mercoledì', time: '13:30/14:30', instructor: 'Andrea', capacity: 20 },
      { course: 'Fullbody Workout', day: 'Mercoledì', time: '18:05/19:05', instructor: 'Gianluca', capacity: 20 },
      { course: 'GAG', day: 'Mercoledì', time: '19:15/20:15', instructor: 'Gianluca', capacity: 20 },

      // Giovedì
      { course: 'Posturale', day: 'Giovedì', time: '09:30/10:30', instructor: 'Sisto', capacity: 20 },
      { course: 'Posturale', day: 'Giovedì', time: '10:30/11:30', instructor: 'Sisto', capacity: 20 },
      { course: 'Burn & Tone', day: 'Giovedì', time: '13:30/14:30', instructor: 'Luca', capacity: 20 },
      { course: 'Pilates', day: 'Giovedì', time: '16:15/17:15', instructor: 'Hanna', capacity: 20 },
      { course: 'Pilates', day: 'Giovedì', time: '17:15/18:15', instructor: 'Hanna', capacity: 20 },
      { course: 'Funzionale', day: 'Giovedì', time: '18:35/19:35', instructor: 'Andrea', capacity: 20 },
      { course: 'Estetica', day: 'Giovedì', time: '19:40/20:40', instructor: 'Gianluca', capacity: 20 },

      // Venerdì
      { course: 'Pump', day: 'Venerdì', time: '10:00/11:00', instructor: 'Gianluca', capacity: 20 },
      { course: 'Funzionale', day: 'Venerdì', time: '13:30/14:30', instructor: 'Andrea', capacity: 20 },
      { course: 'Total Body Coreografico', day: 'Venerdì', time: '18:00/19:00', instructor: 'Gianluca', capacity: 20 },
      { course: 'Triceps Legs + Butt', day: 'Venerdì', time: '19:00/20:00', instructor: 'Gianluca', capacity: 20 },
    ];

    for (const item of scheduleData) {
      const course = courses[item.course];
      const instructor = instructors[item.instructor];
      
      await Schedule.create({
        courseId: course._id,
        day: item.day,
        time: item.time,
        instructorId: instructor?._id,
        instructorName: item.instructor,
        capacity: item.capacity
      });
    }
    console.log('Schedule created:', scheduleData.length, 'items');

    console.log('\\n=== SEED COMPLETATO ===');
    console.log('\\nCredenziali di accesso:');
    console.log('Admin: admin@gymcity.com / admin123');
    console.log('Istruttore: gianluca@gymcity.com / instructor123');
    console.log('Utente: mario.rossi@example.com / user123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
