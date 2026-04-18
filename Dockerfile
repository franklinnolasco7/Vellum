FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
  curl \
  wget \
  git \
  build-essential \
  pkg-config \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libwebkit2gtk-4.1-dev \
  dbus-x11 \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash developer

USER developer
WORKDIR /home/developer

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
  && /home/developer/.cargo/bin/rustup default stable \
  && touch /home/developer/.sudo_as_admin_successful /home/developer/.hushlogin

ENV PATH="/home/developer/.cargo/bin:${PATH}"

WORKDIR /workspace

# Install frontend dependencies (optional, can skip if you prefer)
# COPY package.json package-lock.json ./
# RUN npm install

CMD ["/bin/bash"]
