import { Exclude } from "class-transformer";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Preferance } from "../types/User";
import { Friendship } from "./Friendship";
import { Notification } from "./Notification";
import { Signal } from "./Signal";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Exclude()
  @Column({ nullable: true })
  authId: string;

  @Column()
  names: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Index()
  @Column({ nullable: true, unique: true })
  username: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @Column({ nullable: true })
  principal: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Exclude()
  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ default: false })
  profileStatus: Boolean;

  @Column({ type: "jsonb", nullable: true })
  preferances: Preferance;

  @Column({ nullable: true })
  notificationToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Friendship, (friendship) => friendship.user)
  friendships: Friendship[];

  @OneToMany(() => Signal, (signal) => signal.user)
  signals: Signal[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    nullable: true,
    onDelete: "CASCADE"
  })
  notifications?: Notification[];
}
