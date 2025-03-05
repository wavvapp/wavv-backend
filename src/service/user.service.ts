import dataSource from "../data-source";
import { Friendship } from "../entity/friendship.entity";
import { Signal } from "../entity/signal.entity";
import { User } from "../entity/user.entity";
import { AppUser } from "../types/auth";

export class UserService {
  static async deleteMyAccount(user: AppUser) {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    let isDeleted = false;

    try {
      await queryRunner.manager.delete(Friendship, { user: { id: user.id } });
      await queryRunner.manager.delete(Friendship, { friend: { id: user.id } });

      await queryRunner.manager.delete(Signal, { user: { id: user.id } });

      await queryRunner.manager.delete(User, { id: user.id });

      await queryRunner.commitTransaction();
      isDeleted = true;
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      isDeleted = false;
    } finally {
      await queryRunner.release();
    }

    return isDeleted;
  }

  static async getUserById(userId: string) {
    return await User.findOneBy({ id: userId })
  }
}
