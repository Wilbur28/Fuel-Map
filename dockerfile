FROM node:12

RUN git clone https://github.com/Wilbur28/Fuel-Map.git

WORKDIR Fuel-Map

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]