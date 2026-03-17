import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: ['src/**/*.entity.ts'],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to DB');

  // Seed admin user
  const userRepo = AppDataSource.getRepository('users');
  const existing = await userRepo.findOne({ where: { email: 'admin@eventhub.com' } });
  if (!existing) {
    await userRepo.save({
      email: 'admin@eventhub.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'admin',
    });
    console.log('Admin created: admin@eventhub.com / admin123');
  }

  // Seed categories
  const catRepo = AppDataSource.getRepository('categories');
  const cats = [
    { name: 'Music', description: 'Concerts, festivals, live performances', icon: '🎵' },
    { name: 'Technology', description: 'Tech conferences, hackathons, workshops', icon: '💻' },
    { name: 'Sports', description: 'Sporting events, fitness, outdoor activities', icon: '⚽' },
    { name: 'Arts', description: 'Art exhibitions, theater, cultural events', icon: '🎨' },
    { name: 'Business', description: 'Networking, conferences, seminars', icon: '💼' },
    { name: 'Food & Drink', description: 'Food festivals, wine tastings, cooking classes', icon: '🍕' },
    { name: 'Education', description: 'Workshops, lectures, training sessions', icon: '📚' },
    { name: 'Health', description: 'Wellness, yoga, mental health events', icon: '💚' },
  ];
  for (const cat of cats) {
    const ex = await catRepo.findOne({ where: { name: cat.name } });
    if (!ex) await catRepo.save(cat);
  }
  console.log('Categories seeded');

  await AppDataSource.destroy();
  console.log('Seed complete!');
}

seed().catch(console.error);
