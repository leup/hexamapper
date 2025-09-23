# Utilisation :
# Placez ce Dockerfile à la racine du projet.
# Ce conteneur sert le dossier courant en HTTP via nginx.

FROM nginx:alpine

# Copie du projet dans le dossier web de nginx
COPY . /usr/share/nginx/html

# Configuration nginx minimale
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Traefik gère le reverse proxy et le HTTPS, inutile de le configurer ici.
CMD ["nginx", "-g", "daemon off;"]
