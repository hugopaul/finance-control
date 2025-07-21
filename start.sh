#!/bin/bash

# Script para executar o Controle Financeiro
# Uso: ./start.sh [dev|prod]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Controle Financeiro - Docker${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar se o Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
}

# Verificar se o Docker está rodando
check_docker_running() {
    if ! docker info &> /dev/null; then
        print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
        exit 1
    fi
}

# Função para parar containers existentes
stop_existing() {
    print_message "Parando containers existentes..."
    docker-compose down 2>/dev/null || true
}

# Função para executar em desenvolvimento
run_dev() {
    print_message "Iniciando em modo DESENVOLVIMENTO..."
    print_message "Frontend: http://localhost:3000"
    print_message "Backend: https://solidtechsolutions.com.br/api"
    print_message "Database: localhost:5433"
    echo ""
    
    docker-compose up --build
}

# Função para executar em produção
run_prod() {
    print_message "Iniciando em modo PRODUÇÃO..."
    print_message "Frontend: http://localhost:3000"
    print_message "Backend: https://solidtechsolutions.com.br/api"
    print_message "Database: localhost:5433"
    echo ""
    
    docker-compose -f docker-compose.prod.yml up --build
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [dev|prod|stop|logs|help]"
    echo ""
    echo "Comandos:"
    echo "  dev     - Executar em modo desenvolvimento (padrão)"
    echo "  prod    - Executar em modo produção"
    echo "  stop    - Parar todos os containers"
    echo "  logs    - Mostrar logs dos containers"
    echo "  help    - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0        # Executar em desenvolvimento"
    echo "  $0 dev    # Executar em desenvolvimento"
    echo "  $0 prod   # Executar em produção"
    echo "  $0 stop   # Parar containers"
}

# Função para parar containers
stop_containers() {
    print_message "Parando containers..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_message "Containers parados com sucesso!"
}

# Função para mostrar logs
show_logs() {
    print_message "Mostrando logs dos containers..."
    docker-compose logs -f
}

# Main
main() {
    print_header
    
    # Verificações iniciais
    check_docker
    check_docker_running
    
    # Processar argumentos
    case "${1:-dev}" in
        "dev"|"development")
            stop_existing
            run_dev
            ;;
        "prod"|"production")
            stop_existing
            run_prod
            ;;
        "stop")
            stop_containers
            ;;
        "logs")
            show_logs
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Comando inválido: $1"
            show_help
            exit 1
            ;;
    esac
}

# Executar main com todos os argumentos
main "$@" 