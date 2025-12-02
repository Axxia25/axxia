FROM chatwoot/chatwoot:v4.7.0

# Metadata da imagem customizada
LABEL maintainer="Axxia Tech"
LABEL description="Fluxo Ti - Chatwoot customizado com Kanban integrado"
LABEL version="4.7.0-axxia.1"

# Copiar código customizado
COPY . /app

# Instalar dependências adicionais (React + Kanban)
USER root
RUN cd /app && \
    pnpm install && \
    pnpm run build

# Voltar para usuário chatwoot
USER chatwoot

# Precompilar assets com customizações
RUN cd /app && \
    RAILS_ENV=production bundle exec rake assets:precompile

EXPOSE 3000
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
