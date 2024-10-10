import axios from 'axios'

const request = axios.create({
    baseURL: 'http://127.0.0.1:8080' //直接指定
})
request.interceptors.response.use((response) => {
    return response.data
})
request.interceptors.request.use((config) => {
    config.headers.Authorization = `${localStorage.getItem('token')}`
    return config
})

export default request
