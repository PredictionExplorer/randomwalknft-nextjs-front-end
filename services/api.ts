import axios from "axios";

const baseUrl = "https://randomwalknft-api.com/";

class ApiService {
  public async create(token_id: number) {
    await axios.post(baseUrl + "tokens", { token_id });
  }

  public async get(token_id: number | string) {
    const { data } = await axios.get(baseUrl + "tokens/" + token_id);
    const url = `http://198.58.105.159:9094/api/rwalk/tokens/history/${token_id}/0x895a6F444BE4ba9d124F61DF736605792B35D66b/0/1000`;
    const res = await axios.get(url);
    data.tokenHistory = res?.data?.TokenHistory;
    return data;
  }

  public async result() {
    const { data } = await axios.get(baseUrl + "result");
    return data;
  }

  public async giveaway() {
    const { data } = await axios.get(baseUrl + "giveaway");
    return data;
  }

  public async random() {
    const { data } = await axios.get(baseUrl + "random");
    return data;
  }

  public async tradingHistory() {
    const url = `http://198.58.105.159:9094/api/rwalk/trading/sales/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08/0/1000000`;
    const res = await axios.get(url);
    const data = res?.data?.Trading;
    return data;
  }
}

export default new ApiService();
