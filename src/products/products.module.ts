import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities/index.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Product, ProductImage])
  ],
  exports: [ProductsService, TypeOrmModule]
})
export class ProductsModule { }
