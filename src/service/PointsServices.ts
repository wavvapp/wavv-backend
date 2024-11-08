import axios from "axios";

class PointsServices {
  private readonly USER_ENDPOINT = this.cannisterClien("/users");

  private cannisterClien(path: string) {
    return `${process.env.POINTS_CANISTER_BASE_URL}${path}`;
  }

  async initWavvUserICPIdentity(id: string) {
    const response = await axios.post(this.USER_ENDPOINT, {
      data: { id, points: 0 },
    });
    return response.data;
  }

  async getPointsByUserId(id: string) {
    const response = await axios.get(`${this.USER_ENDPOINT}/${id}`);
    return response.data;
  }

  async insreaseUserPoints(id: string, points: number) {
    const response = await axios.post(
      `${this.USER_ENDPOINT}/${id}/increase`,
      {
        data: {
          id,
          points,
        },
      }
    );
    return response.data;
  }

  async decreaseUserPoints(id: string) {
    const response = await axios.post(
      `${this.USER_ENDPOINT}/${id}/decrease`,
      {
        data: {
          id,
        },
      }
    );
    return response.data;
  }
}

export default PointsServices
