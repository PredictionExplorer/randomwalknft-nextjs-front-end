import axios from "axios";

const baseUrl = "https://randomwalknft-api.com/";

class ApiService {
  public async create(token_id: number) {
    await axios.post(baseUrl + "tokens", { token_id });
  }

  public async add_game(nft1: number, nft2: number, nft1_win: number) {
    await axios.post(baseUrl + "add_game", { nft1, nft2, nft1_win });
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

  public async ratingOrder() {
    const { data } = await axios.get(baseUrl + "rating_order");
    return data;
  }

  public async tradingHistory(page: number) {
    const perPage = 20;
    let url = `http://198.58.105.159:9094/api/rwalk/trading/sales/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08/${perPage *
      (page - 1)}/${perPage}`;
    let res = await axios.get(url);
    let data = res?.data?.Trading;
    data.sort((a: { TimeStamp: number; }, b: { TimeStamp: number; }) => {
      return b.TimeStamp - a.TimeStamp;
    });
    url = `http://198.58.105.159:9094/api/rwalk/trading/sales/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08/0/1000000`;
    res = await axios.get(url);
    let result = {
      tradingHistory: data,
      totalCount: res.data.Trading.length ?? 0,
    };
    return result;
  }
}

export default new ApiService();
