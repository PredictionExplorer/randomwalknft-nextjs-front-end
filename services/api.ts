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

  public async get_info(token_id: number | string) {
    const { data } = await axios.get(baseUrl + "token_info/" + token_id);
    return data;
  }

  public async get_sell(id = -1) {
    let { data } = await axios.get(baseUrl + "sell_offer");
    data = data.sort((a: any, b: any) => a.Price - b.Price);
    if (id == -1) return data;
    const result = data.filter((x) => {
      return x.TokenId == id;
    });
    return result;
  }

  public async get_buy(id = -1) {
    let { data } = await axios.get(baseUrl + "buy_offer");
    data = data.sort((a: any, b: any) => a.Price - b.Price);
    if (id == -1) return data;
    const result = data.filter((x) => {
      return x.TokenId == id;
    });
    return result;
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

  public async voteCount() {
    const { data } = await axios.get(baseUrl + "vote_count");
    return data;
  }

  public async tradingHistory(page: number) {
    let perPage = 20;
    let url = `http://198.58.105.159:9094/api/rwalk/trading/sales/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08/0/1000000`;
    let res = await axios.get(url);
    let totalCount = res.data.Trading.length ?? 0;
    let start = totalCount - perPage * page;
    if (start < 0) {
      perPage += start;
      start = 0;
    }
    url = `http://198.58.105.159:9094/api/rwalk/trading/sales/0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08/${start}/${perPage}`;
    res = await axios.get(url);
    let data = res?.data?.Trading;
    data.sort((a: { TimeStamp: number }, b: { TimeStamp: number }) => {
      return b.TimeStamp - a.TimeStamp;
    });
    let result = {
      tradingHistory: data,
      totalCount,
    };
    return result;
  }

  // auth
  public async register(username: string, email: string, password: string) {
    await axios.post(baseUrl + "register", { username, email, password });
  }

  public async login(email: string, password: string) {
    const { data } = await axios.post(baseUrl + "login", { email, password });
    return data;
  }
}

export default new ApiService();
