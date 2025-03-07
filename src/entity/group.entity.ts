import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Friendship } from "./friendship.entity";
import { User } from "./user.entity";

@Entity("groups")
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.groups, { onDelete: "CASCADE" })
  owner: User;

  @ManyToMany(() => Friendship, (friendship) => friendship.groups, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinTable({ name: "user_friendship_groups" })
  membership: Friendship[];
}
