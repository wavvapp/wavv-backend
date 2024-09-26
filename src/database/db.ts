import dataSource from "../data-source";
import { User } from "../entity/User";

export default {
  users: dataSource.getRepository(User),
};
