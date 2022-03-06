import axios from 'axios';

const quickBooks = axios.create({
    baseURL:"http://localhost:3000", // this is backend URL
    // withCredentials: true,
    headers:{
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    }
})

quickBooks.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
quickBooks.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

export default quickBooks;
