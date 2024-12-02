import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { FriendSignal } from "./FriendSignal";
import { User } from "./User";

@Entity()
export class Friendship extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.friendships)
  user: User;

  @ManyToOne(() => User, (user) => user.friendships)
  friend: User;

  @OneToMany(() => FriendSignal, (friendSignal) => friendSignal.friendship, { cascade: true, onDelete: "CASCADE" })
  friendSignal: FriendSignal[];

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
