# Sử dụng node image
FROM node:20

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy mã nguồn ứng dụng
COPY . .

# Mở cổng 4001
EXPOSE 4001

# Chạy ứng dụng
CMD ["npm", "run", "start:dev"]