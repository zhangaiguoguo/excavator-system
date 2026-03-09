import axios from 'axios'
import { message } from 'ant-design-vue'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api', // url = base url + request url
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    // If the API returns a custom status code, handle it here.
    // For now assuming standard RESTful response where 2xx is success.
    return res
  },
  error => {
    console.log('err' + error) // for debug
    message.error(error.message || 'Request Error')
    return Promise.reject(error)
  }
)

export default service
