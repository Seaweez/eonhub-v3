import axios from "axios";

export const eonhubApiCreate  = (token?: string) =>  axios.create({
    baseURL: process?.env?.NEXT_PUBLIC_EONHUB_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});



export const googleApiCreate = (token?: string) => axios.create({
    baseURL: 'https://www.googleapis.com',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    // transformRequest: [
    //     (data) => {
    //         return JSON.stringify(data);
    //     },
    // ],
    // transformResponse: [
    //     (data) => {
    //         return JSON.parse(data);
    //     },
    // ],
});