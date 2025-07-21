# Etapa 1: build da imagem
FROM python:3.11-slim AS builder

WORKDIR /app

# Instale dependências do sistema (se necessário)
RUN apt-get update && apt-get install -y build-essential

# Copie requirements e instale dependências
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --user -r requirements.txt

# Etapa 2: imagem final
FROM python:3.11-slim

WORKDIR /app

# Copie o código e as libs do builder
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

CMD ["uvicorn", "app.interface.api.main:app", "--host", "0.0.0.0", "--port", "8000"] 