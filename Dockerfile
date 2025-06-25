# ——————————————————————————————
# Выполняется в каталоге, где находится package.json
FROM node:18-alpine

WORKDIR /app

# 1. Копируем только package*.json
COPY backend/package*.json ./

# 2. Устанавливаем зависимости
RUN npm install --production

# 3. Копируем весь код
COPY backend/. .

# 4. Генерируем Prisma client и создаём папку uploads
RUN npx prisma generate && mkdir -p uploads

EXPOSE 5000
CMD ["npm", "start"]

