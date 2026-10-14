FROM catthehacker/ubuntu:act-latest
USER root
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
ENTRYPOINT ["bash"]
