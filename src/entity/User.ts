import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Friendship } from "./Friendship";
import { Signal } from "./Signal";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  location: string;

  @Column()
  bio: string;

  @Column()
  profilePictureUrl: string;

  @Column()
  password: string;

  @Column()
  emailVerified: boolean;

  @Column()
  phoneVerified: boolean;

  @Column()
  isActive: boolean;

  @Column()
  lastLogin: Date;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordTokenExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Friendship, (friendship) => friendship.user)
  friendships: Friendship[];

  @OneToMany(() => Signal, (signal) => signal.user)
  signals: Signal[];
}
