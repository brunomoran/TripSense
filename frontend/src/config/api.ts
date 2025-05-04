const API_BASE_URL = 'http://localhost:5000/api'

export const getApiUrl = () => {
    return API_BASE_URL
}

export const apiPath = (path: string) => `${API_BASE_URL}${path}`