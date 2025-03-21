import axios from 'axios';

const urlBase = 'http://192.168.0.103:3000/api/';
export const BASE_URL = 'http://192.168.0.103:3000/';

const useConexion = () => {
  const get = async ( token: string, url: string, params?: any) => {
    try {
      const response = await axios.get(urlBase + url, {
        params,
        headers : {
            "Content-Type": "application/json",
            "x-api-token": token
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const post = async (url: string, data: any, token?: string) => {
    try {
      const response = await axios.post(urlBase + url, data, {
        headers : {
            "Content-Type": "application/json",
            "x-api-token": token
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error posting data:', error);
      throw error;
    }
  };

  return { get, post };
};

export default useConexion;