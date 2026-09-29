# The site, as one image.
#
# The same three stages as the panel's next door and for the same reasons: what
# ends up running carries none of what built it, and Next's standalone output is
# a few megabytes of traced server rather than the whole of node_modules.

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Substituted into the client bundle while it builds, so these cannot come from
# the environment the container starts with. NEXT_PUBLIC_SITE_URL is the one
# that matters: wrong here and every canonical link, sitemap entry and share
# card names the wrong host while the server looks perfectly healthy.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_TOUR_VIDEO_URL
ARG NEXT_PUBLIC_TOUR_POSTER_URL
ARG NEXT_PUBLIC_TOUR_CAPTIONS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_TOUR_VIDEO_URL=$NEXT_PUBLIC_TOUR_VIDEO_URL
ENV NEXT_PUBLIC_TOUR_POSTER_URL=$NEXT_PUBLIC_TOUR_POSTER_URL
ENV NEXT_PUBLIC_TOUR_CAPTIONS_URL=$NEXT_PUBLIC_TOUR_CAPTIONS_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Brotli and gzip copies of every script and stylesheet, at the highest levels,
# written once here. Caddy serves /_next/static from disk and picks the .br, so
# a visitor gets files about a seventh smaller than the app's on the fly gzip.
# The server's deploy.sh copies them out to /srv/site/static before the swap.
RUN node scripts/precompress.mjs .next/static


FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3050
ENV HOSTNAME=0.0.0.0

# Not root. Nothing here writes to disk at all: the site has no database, no
# uploads and no state, which is most of why it is a small thing to host.
RUN groupadd --system --gid 1002 site \
 && useradd --system --uid 1002 --gid site site

COPY --from=builder --chown=site:site /app/.next/standalone ./
COPY --from=builder --chown=site:site /app/.next/static ./.next/static
COPY --from=builder --chown=site:site /app/public ./public

USER site
EXPOSE 3050

CMD ["node", "server.js"]
