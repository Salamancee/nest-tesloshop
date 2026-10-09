import { CreateProductDto } from './dto/create-product.dto.js';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { DataSource, Repository } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { ProductImage } from './entities/index.js';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly datasource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({ ...productDetails, images: images.map(image => this.productImageRepository.create({ url: image })) });
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error: any) {
      this.handleDbExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images?.map(image => image.url)
    }));
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id: id });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async findOnePlain(id: string) {
    const { images = [], ...rest } = await this.findOne(id);
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);

    //CREATE QUERY RUNNER
    const queryRuner = this.datasource.createQueryRunner();
    await queryRuner.connect();
    await queryRuner.startTransaction();

    try {
      if (images) {
        await queryRuner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      }


      await queryRuner.manager.save(product);
      // this.productRepository.save(product);

      await queryRuner.commitTransaction();
      await queryRuner.release();
      return this.findOnePlain(id);
    } catch (error) {
      await queryRuner.rollbackTransaction();
      await queryRuner.release();
      this.handleDbExceptions(error);
    }
  }

  async remove(id: string) {
    const { affected } = await this.productRepository.delete({ id: id });
    if (affected == 0) throw new NotFoundException(`Product with ID ${id} not found`);
    return `Product with ID ${id} deleted succesfully`;
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException("Unspected error, check server logs");
  }


  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().execute();
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }
}
