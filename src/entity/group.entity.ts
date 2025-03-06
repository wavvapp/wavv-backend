import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Friendship } from "./friendship.entity";
import { User } from "./user.entity";


@Entity("user_friendship_groups")
export class UserFriendshipGroups extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  ownerId: string

  friendshipiId: string
}


@Entity("groups")
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.groups)
  owner: User;

  @ManyToMany(() =>  Friendship, (friendship) =>  friendship.groups,  { nullable: true })
  @JoinTable({ name: "user_friendship_groups" })
  membership: Friendship[]
}
