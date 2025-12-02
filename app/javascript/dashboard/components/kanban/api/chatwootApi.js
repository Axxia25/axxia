import axios from 'axios';

// Criar instância axios para comunicar com Chatwoot
const chatwootApi = axios.create({
  baseURL: window.chatwootConfig?.apiHost || '/api/v1',
});

// Interceptar requests para adicionar token de autenticação
chatwootApi.interceptors.request.use(config => {
  const authData = localStorage.getItem('auth_data');
  if (authData) {
    try {
      const { authToken } = JSON.parse(authData);
      config.headers.api_access_token = authToken;
    } catch (error) {
      console.error('Erro ao parsear auth_data:', error);
    }
  }
  return config;
});

export default chatwootApi;
