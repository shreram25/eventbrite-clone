import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.categoriesRepo.find();
  }

  async seed() {
    const categories = [
      { name: 'Music', description: 'Concerts, festivals, live performances', icon: '🎵' },
      { name: 'Technology', description: 'Tech conferences, hackathons, workshops', icon: '💻' },
      { name: 'Sports', description: 'Sporting events, fitness, outdoor activities', icon: '⚽' },
      { name: 'Arts', description: 'Art exhibitions, theater, cultural events', icon: '🎨' },
      { name: 'Business', description: 'Networking, conferences, seminars', icon: '💼' },
      { name: 'Food & Drink', description: 'Food festivals, wine tastings, cooking classes', icon: '🍕' },
      { name: 'Education', description: 'Workshops, lectures, training sessions', icon: '📚' },
      { name: 'Health', description: 'Wellness, yoga, mental health events', icon: '💚' },
    ];

    for (const cat of categories) {
      const existing = await this.categoriesRepo.findOne({ where: { name: cat.name } });
      if (!existing) {
        await this.categoriesRepo.save(this.categoriesRepo.create(cat));
      }
    }
    return this.findAll();
  }
}
