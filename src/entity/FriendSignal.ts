import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Friendship } from "./Friendship";
import { Signal } from "./Signal";

@Entity()
export class FriendSignal {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Friendship)
  friendship: Friendship;

  @ManyToOne(() => Signal, (signal) => signal.friendSignals)
  signal: Signal;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
