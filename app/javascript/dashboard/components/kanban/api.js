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
      // eslint-disable-next-line no-console
      console.error('Erro ao parsear auth_data:', error);
    }
  }
  return config;
});

// Funções específicas para o Kanban
export const kanbanApi = {
  // Buscar todos os contatos
  async getContacts(accountId) {
    const response = await chatwootApi.get(`/accounts/${accountId}/contacts`);
    return response.data;
  },

  // Buscar custom attributes
  async getCustomAttributes(accountId) {
    const response = await chatwootApi.get(
      `/accounts/${accountId}/custom_attribute_definitions`
    );
    return response.data.filter(
      attr =>
        attr.attribute_display_type === 'list' &&
        attr.attributable_type === 'contact'
    );
  },

  // Atualizar contato (mover no Kanban)
  async updateContact(accountId, contactId, customAttributes) {
    const response = await chatwootApi.patch(
      `/accounts/${accountId}/contacts/${contactId}`,
      {
        custom_attributes: customAttributes,
      }
    );
    return response.data;
  },
};

export default chatwootApi;
