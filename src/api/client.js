import axios from 'axios';

const client = axios.create({baseURL: 'http://localhost:2121/api'})

export default client;