import axios from "axios";

class PointsServices {
  private readonly USER_ENDPOINT = this.cannisterClien("/users");

  private cannisterClien(path: string) {
    return `${process.env.POINTS_CANISTER_BASE_URL}${path}`;
  }

  async initWavvUserICPIdentity(id: string) {
    //TODO: CANNISTER RESPONSE ERRORS
    try {
      const response = await axios.post(this.USER_ENDPOINT, {
        userId: id,
        points: 0,
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getPointsByUserId(id: string) {
    //TODO: CANNISTER RESPONSE ERRORS
    try {
      const response = await axios.get(`${this.USER_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {

      /**
       * 
       * If user does not exist on the canister we create the user them with 0 points.
       * 
      */
      await this.initWavvUserICPIdentity(id)
      return { id, points: 0 };
    }
  }

  async insreaseUserPoints(id: string, points: number) {
    //TODO: CANNISTER RESPONSE ERRORS
    try {
      const response = await axios.post(
        `${this.USER_ENDPOINT}/${id}/increase`,
        {
          id,
          points,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async decreaseUserPoints(id: string) {
    //TODO: CANNISTER RESPONSE ERRORS
    try {
      const response = await axios.post(
        `${this.USER_ENDPOINT}/${id}/decrease`,
        {
          id,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}

export default PointsServices;
