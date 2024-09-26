import { Repository } from "typeorm";
import { User } from "../entity/User";
import DataSource from "../data-source";
class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = DataSource.getRepository(User);
  }

  async login() {
    // login logic
  }
}

export default AuthService;
