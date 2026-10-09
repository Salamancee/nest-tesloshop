import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { type Product } from "./product.entity.js";

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        "Product",
        (product: Product) => product.images,
        {  onDelete: 'CASCADE' }
    )
    product: Product;
}