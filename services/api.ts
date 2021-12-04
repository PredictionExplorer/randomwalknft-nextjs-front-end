import axios from 'axios'

const baseUrl = 'https://randomwalknft-api.com/'

class ApiService {
  public async create(token_id: number) {
    await axios.post(baseUrl + 'tokens', { token_id })
  }

  public async get(token_id: number | string) {
    const { data } = await axios.get(baseUrl + 'tokens/' + token_id)
    return data;
  }

  public async result() {
    const { data } = await axios.get(baseUrl + 'result')
    return data
  }

  public async giveaway() {
    const { data } = await axios.get(baseUrl + 'giveaway')
    return data
  }

  public async random() {
    const { data } = await axios.get(baseUrl + 'random')
    return data
  }
}

export default new ApiService()
