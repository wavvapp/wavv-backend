import axios from "axios";

type GetPointsByEmail = {
  id: string;
  sub: string;
};

type IncreaseUserPoints = {
  sub: string;
  points: number;
};

type DecreaseUserPoints = IncreaseUserPoints;

class PointsServices {
  private readonly USER_ENDPOINT = this.canisterClient("/v3/users");

  private canisterClient(path: string) {
    return `${process.env.POINTS_CANISTER_BASE_URL}${path}`;
  }

  async getPointsByEmailId({ id, sub }: GetPointsByEmail) {
    try {
      const response = await axios.get(`${this.USER_ENDPOINT}/${sub}`);
      return response.data;
    } catch (error) {
      return { id, points: 0 };
    }
  }

  async increaseUserPoints({ sub, points }: IncreaseUserPoints) {
    try {
      const response = await axios.post(
        `${this.USER_ENDPOINT}/${sub}/increase`,
        {
          points,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async decreaseUserPoints({ sub, points }: DecreaseUserPoints) {
    try {
      const response = await axios.post(
        `${this.USER_ENDPOINT}/${sub}/increase`,
        {
          points,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async registerUserOnCanister({ sub }: { sub: string }) {
    try {
      const response = await axios.post(`${this.USER_ENDPOINT}`, {
        id: sub,
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}

export default PointsServices;
