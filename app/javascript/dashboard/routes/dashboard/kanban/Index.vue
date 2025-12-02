<template>
  <div class="kanban-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('KANBAN.TITLE') }}</h1>
      <p class="page-subtitle">{{ $t('KANBAN.SUBTITLE') }}</p>
    </div>
    
    <!-- Controles -->
    <div class="kanban-controls">
      <div class="control-group">
        <label class="control-label">{{ $t('KANBAN.SELECT_ATTRIBUTE') }}:</label>
        <select 
          v-model="selectedAttribute" 
          @change="onAttributeChange"
          class="kanban-select"
          :disabled="loading"
        >
          <option value="">{{ $t('KANBAN.SELECT_PLACEHOLDER') }}</option>
          <option 
            v-for="attr in listAttributes" 
            :key="attr.attribute_key"
            :value="attr"
          >
            {{ attr.attribute_display_name }}
          </option>
        </select>
      </div>
      
      <button 
        @click="refreshContacts"
        class="btn btn-primary"
        :disabled="loading"
      >
        <i class="icon ion-refresh" v-if="!loading"></i>
        <i class="icon ion-load-c rotating" v-if="loading"></i>
        {{ loading ? $t('KANBAN.LOADING') : $t('KANBAN.REFRESH') }}
      </button>
    </div>
    
    <!-- Kanban Board -->
    <div v-if="selectedAttribute" class="kanban-container">
      <kanban-board-react
        :contacts="contacts"
        :attribute="selectedAttribute"
        :on-contact-move="handleContactMove"
        :account-id="currentAccount.id"
        :loading="loading"
      />
    </div>
    
    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <i class="icon ion-ios-browsers-outline"></i>
      </div>
      <h3 class="empty-state-title">{{ $t('KANBAN.EMPTY_STATE.TITLE') }}</h3>
      <p class="empty-state-description">{{ $t('KANBAN.EMPTY_STATE.DESCRIPTION') }}</p>
      <router-link 
        :to="`/app/accounts/${currentAccount.id}/settings/custom-attributes`" 
        class="btn btn-link"
      >
        {{ $t('KANBAN.EMPTY_STATE.CONFIGURE_BUTTON') }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { applyReactInVue } from 'veaury';
import KanbanApp from '../../../components/kanban/App';
import { mapGetters } from 'vuex';

export default {
  name: 'KanbanView',
  
  components: {
    KanbanBoardReact: applyReactInVue(KanbanApp)
  },
  
  data() {
    return {
      contacts: [],
      listAttributes: [],
      selectedAttribute: null,
      loading: false,
      error: null
    };
  },
  
  computed: {
    ...mapGetters({
      currentAccount: 'getCurrentAccount'
    })
  },
  
  async mounted() {
    await this.initialize();
  },
  
  methods: {
    async initialize() {
      try {
        await this.fetchCustomAttributes();
        
        // Auto-selecionar primeiro atributo se houver
        if (this.listAttributes.length > 0) {
          this.selectedAttribute = this.listAttributes[0];
          await this.fetchContacts();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro na inicialização:', error);
        this.showError('Erro ao carregar dados iniciais');
      }
    },
    
    async fetchCustomAttributes() {
      try {
        const response = await this.$store.dispatch('customAttributes/get', {
          attributableType: 'contact'
        });
        
        this.listAttributes = response.filter(
          attr => attr.attribute_display_type === 'list'
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao buscar custom attributes:', error);
        throw error;
      }
    },
    
    async fetchContacts() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$store.dispatch('contacts/get');
        this.contacts = Array.isArray(response) ? response : response.data || [];
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao buscar contatos:', error);
        this.showError('Erro ao carregar contatos');
        this.contacts = [];
      } finally {
        this.loading = false;
      }
    },
    
    async handleContactMove({ contactId, newValue }) {
      try {
        await this.$store.dispatch('contacts/update', {
          id: contactId,
          custom_attributes: {
            [this.selectedAttribute.attribute_key]: newValue
          }
        });
        
        // Atualizar lista local
        await this.fetchContacts();
        
        this.$toast.success(this.$t('KANBAN.CONTACT_MOVED_SUCCESS'));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao mover contato:', error);
        this.$toast.error(this.$t('KANBAN.CONTACT_MOVE_ERROR'));
      }
    },
    
    async onAttributeChange() {
      if (this.selectedAttribute) {
        await this.fetchContacts();
      } else {
        this.contacts = [];
      }
    },
    
    async refreshContacts() {
      if (this.selectedAttribute) {
        await this.fetchContacts();
      }
    },
    
    showError(message) {
      this.error = message;
      if (this.$toast) {
        this.$toast.error(message);
      }
    }
  }
};
</script>

<style scoped>
.kanban-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--space-large);
  background: var(--color-background);
}

.page-header {
  margin-bottom: var(--space-large);
}

.page-title {
  font-size: var(--font-size-mega);
  font-weight: var(--font-weight-bold);
  color: var(--color-heading);
  margin: 0 0 var(--space-mini) 0;
}

.page-subtitle {
  color: var(--color-body);
  margin: 0;
  font-size: var(--font-size-default);
}

.kanban-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-normal);
  background: var(--color-background-light);
  border-radius: var(--border-radius-normal);
  margin-bottom: var(--space-large);
  border: 1px solid var(--color-border-light);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--space-small);
}

.control-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-body);
  font-size: var(--font-size-small);
}

.kanban-select {
  min-width: 250px;
  padding: var(--space-small) var(--space-normal);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  background: var(--color-white);
  font-size: var(--font-size-small);
}

.kanban-select:focus {
  outline: none;
  border-color: var(--color-woot);
  box-shadow: 0 0 0 1px var(--color-woot);
}

.kanban-container {
  flex: 1;
  overflow: hidden;
  border-radius: var(--border-radius-normal);
  background: var(--color-white);
  border: 1px solid var(--color-border-light);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--color-body);
}

.empty-state-icon {
  margin-bottom: var(--space-large);
}

.empty-state-icon i {
  font-size: 64px;
  color: var(--color-border-dark);
}

.empty-state-title {
  font-size: var(--font-size-large);
  margin-bottom: var(--space-small);
  color: var(--color-heading);
}

.empty-state-description {
  margin-bottom: var(--space-large);
  max-width: 400px;
}

.btn {
  padding: var(--space-small) var(--space-normal);
  border-radius: var(--border-radius-small);
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-mini);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-woot);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-woot-dark);
}

.btn-link {
  color: var(--color-woot);
  border: 1px solid var(--color-woot);
  background: transparent;
}

.btn-link:hover {
  background: var(--color-woot);
  color: var(--color-white);
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
