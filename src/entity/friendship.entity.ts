import { Exclude } from "class-transformer";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";
import { FriendSignal } from "./friend.signal.entity";
import { User } from "./user.entity";

@Entity()
@Unique(["userId", "friendId"])
export class Friendship extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.friendships)
  user: User;

  @ManyToOne(() => User, (user) => user.friendships)
  friend: User;

  @OneToMany(() => FriendSignal, (friendSignal) => friendSignal.friendship)
  friendSignal: FriendSignal[];

  @Column()
  status: string;

  @Column({ default: false })
  hasNotificationEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @Column({
    generatedType: "VIRTUAL",
    type: "number",
    nullable: true,
  })
  private userId: string;


  @Exclude()
  @Column({
    generatedType: "VIRTUAL",
    type: "number",
    nullable: true,
  })
  private friendId: string;
}
