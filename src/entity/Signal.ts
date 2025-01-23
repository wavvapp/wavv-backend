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
import { isDateExpired } from "../utils/isDateExpired";
import { FriendSignal } from "./FriendSignal";
import { User } from "./User";

@Entity()
export class Signal extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.signals)
  user: User;

  @Column()
  when: string;

  @Column({ nullable: true })
  status_message: string;

  @Column({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP" })
  endsAt: Date

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @Column({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP" })
  activatedAt: Date



  @OneToMany(() => FriendSignal, (friendSignal) => friendSignal.signal)
  friendSignal: FriendSignal[];


  hasEnded(timezone: string) {
    return isDateExpired(this.endsAt, timezone)
  }
}
