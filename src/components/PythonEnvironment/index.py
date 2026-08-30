import os

# Abre o arquivo de log no FS virtual do Emscripten em modo append/criação
log_fd = os.open('/tmp/console.log', os.O_WRONLY | os.O_CREAT | os.O_APPEND)

# Redireciona o stdout (1) e o stderr (2) de baixo nível para o arquivo
os.dup2(log_fd, 1)
os.dup2(log_fd, 2)

# Fecha o descritor temporário, mantendo as cópias ativas nos FDs 1 e 2
os.close(log_fd)