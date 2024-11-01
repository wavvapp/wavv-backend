import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Friendship } from "./Friendship";
import { Signal } from "./Signal";

@Entity()
export class FriendSignal extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Friendship)
  friendship: Friendship;

  @ManyToOne(() => Signal, (signal) => signal.friends)
  signal: Signal;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
