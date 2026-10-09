import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service.js';
import { initialData } from './data/seed-data.js';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService
  ) { }

  async runSeed() {
    this.insertNewProducts();
    return 'Seed executed';
  }

  private async insertNewProducts() {
    this.productService.deleteAllProducts();

    const products = initialData.products;
    const insertPromises: Promise<any>[] = [];

    products.forEach(product => {
      insertPromises.push(this.productService.create(product));
    });


    await Promise.all(insertPromises);

    return true;
  }
}
