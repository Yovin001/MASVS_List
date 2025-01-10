import axios from 'axios';
const urlBase = 'http://localhost:3000/api/';

const useConexion = () => {
    const get = async (url: string, params?: any) => {
        try {
            const response = await axios.get(urlBase+url, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    const post = async (url: string, data: any) => {
        try {
            const response = await axios.post(urlBase+url, data);
            return response.data;
        } catch (error) {
            console.error('Error posting data:', error);
            throw error;
        }
    };

    return { get, post };
};

export default useConexion;