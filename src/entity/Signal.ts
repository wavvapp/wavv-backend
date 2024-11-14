import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { FriendSignal } from "./FriendSignal";
import { User } from "./User";

@Entity()
export class Signal extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.signals)
  user: User;

  @Column()
  status: string;

  @Column()
  when: string;

  @Column({ nullable: true })
  status_message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FriendSignal, (friendSignal) => friendSignal.signal)
  friendSignal: FriendSignal[];
}
