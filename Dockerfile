FROM ghcr.io/astral-sh/uv:python3.14-trixie
LABEL authors="unstoppable"

USER root

RUN groupadd --system --gid 999 beholder \
 && useradd --system --gid 999 --uid 999 --create-home beholder

WORKDIR /app
COPY . /app

EXPOSE 8000/tcp

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1
# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

RUN uv sync --locked
RUN chown -R beholder:beholder /app

USER beholder
CMD ["uv", "run", "fastapi", "dev", "--host", "0.0.0.0"]