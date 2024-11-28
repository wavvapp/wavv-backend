import axios from "axios";

type GetPointsByEmail = {
  id: string;
  email: string;
};

type IncreaseUserPoints = {
  email: string;
  points: number;
};

type DecreaseUserPoints = IncreaseUserPoints;

class PointsServices {
  private readonly USER_ENDPOINT = this.canisterClient("/v3/users");

  private canisterClient(path: string) {
    return `${process.env.POINTS_CANISTER_BASE_URL}${path}`;
  }

  async getPointsByEmail({ id, email }: GetPointsByEmail) {
    try {
      const response = await axios.get(`${this.USER_ENDPOINT}/${email}`);
      return response.data;
    } catch (error) {
      return { id, points: 0 };
    }
  }

  async increaseUserPoints({ email, points }: IncreaseUserPoints) {
    try {
      const response = await axios.post(
        `${this.USER_ENDPOINT}/${email}/increase`,
        {
          email,
          points,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async decreaseUserPoints({ email, points }: DecreaseUserPoints) {
    try {
      const response = await axios.post(
        `${this.USER_ENDPOINT}/${email}/increase`,
        {
          email,
          points,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async registerUserOnCanister({ email }: { email: string }) {
    try {
      const response = await axios.post(`${this.USER_ENDPOINT}`, {
        email,
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}

export default PointsServices;
