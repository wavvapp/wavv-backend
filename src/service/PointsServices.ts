import axios from "axios";

type GetPointsByPrincipal = {
  id: string;
  principal: string;
};

type IncreaseUserPoints = {
  principal: string;
  points: number;
};

type DecreaseUserPoints = IncreaseUserPoints;

class PointsServices {
  private readonly USER_ENDPOINT = this.canisterClient("/v2/users");

  private canisterClient(path: string) {
    return `${process.env.POINTS_CANISTER_BASE_URL}${path}`;
  }

  async getPointsByPrincipal({ id, principal }: GetPointsByPrincipal) {
    //TODO: CANNISTER RESPONSE ERRORS
    try {
      const response = await axios.get(`${this.USER_ENDPOINT}/${principal}`);
      return response.data;
    } catch (error) {
      return { id, points: 0 };
    }
  }

  async increaseUserPoints({ principal, points }: IncreaseUserPoints) {
    //TODO: CANNISTER RESPONSE ERRORS
    try {
      const response = await axios.post(
        `${this.USER_ENDPOINT}/${principal}/increase`,
        {
          principal,
          points,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async decreaseUserPoints({ principal, points }: DecreaseUserPoints) {
    //TODO: CANNISTER RESPONSE ERRORS
    try {
      const response = await axios.post(
        `${this.USER_ENDPOINT}/${principal}/increase`,
        {
          principal,
          points,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}

export default PointsServices;
