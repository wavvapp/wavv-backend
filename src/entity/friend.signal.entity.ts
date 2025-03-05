import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Friendship } from "./friendship.entity";
import { Signal } from "./signal.entity";

@Entity()
export class FriendSignal extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Friendship, friendship => friendship.friendSignal, { onDelete: "CASCADE" })
  friendship: Friendship;

  @ManyToOne(() => Signal, (signal) => signal.friendSignal)
  signal: Signal;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
