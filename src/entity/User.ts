import { Exclude } from "class-transformer";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated("uuid")
  @Exclude()
  uuid: string;

  @Column()
  password: string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
